/**
 * api-ts/api/adapters/bun-sqlite/threads.ts
 *
 * This is a bun-specific implementation of the ThreadsDatabaseAdapter.
 * It uses the bun:sqlite library to interact with the database.
 */

import type { Database } from "bun:sqlite";
import type { Thread, ThreadComplete, ThreadWithDetails, VoteCount } from "../../schema.ts";
import { createId } from "../../utils/create-id.ts";
import { type Result, resultErr, resultOk } from "../../utils/result.ts";
import type {
  FindManyOptions,
  ThreadCreate,
  ThreadsDataAdapter,
  ThreadUpdate,
} from "../adapter-types.ts";
import {
  buildReplyTree,
  mapDbToAccount,
  mapDbToReply,
  mapDbToThread,
  maskDeletedAccount,
} from "../dtos.ts";

export class BunSQLiteThreadsAdapter implements ThreadsDataAdapter {
  constructor(private db: Database) {}

  public async create(thread: ThreadCreate): Promise<Result<Thread>> {
    try {
      const id = createId();
      const now = Date.now();
      const upstreamId = thread.upstreamId || null;
      const allowReplies = thread.allowReplies !== undefined ? thread.allowReplies : true;
      const extras = JSON.stringify(thread.extras || {});

      const stmt = this.db.prepare(`
        INSERT INTO threads (id, account_id, upstream_id, title, body, allow_replies, created_at, updated_at, deleted_at, extras)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
      `);
      stmt.run(
        id,
        thread.accountId,
        upstreamId,
        thread.title,
        thread.body,
        allowReplies ? 1 : 0,
        now,
        now,
        extras,
      );

      const result = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      return resultOk(mapDbToThread(result));
    } catch (err) {
      console.log("THREAD_CREATE", err);
      return resultErr("THREAD_CREATE", "Failed to create thread");
    }
  }

  /**
   * update
   */

  public async update(id: string, thread: ThreadUpdate): Promise<Result<Thread>> {
    try {
      const updatedAt = Date.now();
      const extras = thread.extras ? JSON.stringify(thread.extras) : undefined;

      const updates: string[] = [];
      const values: any[] = [];

      if (thread.title !== undefined) {
        updates.push("title = ?");
        values.push(thread.title);
      }
      if (thread.body !== undefined) {
        updates.push("body = ?");
        values.push(thread.body);
      }
      if (thread.allowReplies !== undefined) {
        updates.push("allow_replies = ?");
        values.push(thread.allowReplies ? 1 : 0);
      }
      if (extras !== undefined) {
        updates.push("extras = ?");
        values.push(extras);
      }

      updates.push("updated_at = ?");
      values.push(updatedAt);
      values.push(id);

      const stmt = this.db.prepare(`UPDATE threads SET ${updates.join(", ")} WHERE id = ?`);
      stmt.run(...values);

      const result = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      if (!result) {
        return resultErr("THREAD_NOT_FOUND", `Thread not found`);
      }
      return resultOk(mapDbToThread(result));
    } catch (err) {
      console.log("THREAD_UPDATE", err);
      return resultErr("THREAD_UPDATE", "Failed to update thread");
    }
  }

  /**
   * delete
   */
  public async delete(id: string): Promise<Result<"ok">> {
    try {
      const existing = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      if (!existing) {
        return resultErr("THREAD_NOT_FOUND", "Thread not found");
      }

      const deletedAt = Date.now();
      const updatedAt = Date.now();

      const stmt = this.db.prepare(`
        UPDATE threads 
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(deletedAt, updatedAt, id);

      return resultOk("ok");
    } catch (err) {
      console.log("THREAD_DELETE", err);
      return resultErr("THREAD_DELETE", "Failed to delete thread");
    }
  }

  /**
   * findOne
   */
  public async findOne(id: string): Promise<Result<Thread>> {
    try {
      const result = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      if (!result) {
        return resultErr("THREAD_NOT_FOUND", `Thread not found`);
      }
      return resultOk(mapDbToThread(result));
    } catch (err) {
      console.log("THREAD_FIND_ONE", err);
      return resultErr("THREAD_FIND_ONE", "Failed to find thread");
    }
  }

  /**
   * findMany
   */
  public async findMany(opts?: FindManyOptions): Promise<Result<Thread[]>> {
    try {
      const limit = opts?.limit || 50;
      const offset = opts?.offset || 0;
      const whereClauses: string[] = [];
      const values: any[] = [];

      if (opts?.where?.accountId) {
        whereClauses.push("account_id = ?");
        values.push(opts.where.accountId);
      }
      if (opts?.where?.upstreamId) {
        whereClauses.push("upstream_id = ?");
        values.push(opts.where.upstreamId);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      let orderClause = "";
      if (opts?.order) {
        const orderParts: string[] = [];
        if (opts.order.createdAt) {
          orderParts.push(`created_at ${opts.order.createdAt.toUpperCase()}`);
        }
        if (opts.order.updatedAt) {
          orderParts.push(`updated_at ${opts.order.updatedAt.toUpperCase()}`);
        }
        if (orderParts.length > 0) {
          orderClause = `ORDER BY ${orderParts.join(", ")}`;
        }
      }

      values.push(limit, offset);
      const query = `SELECT * FROM threads ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
      const results = this.db.prepare(query).all(...values);
      return resultOk(results.map(mapDbToThread));
    } catch (err) {
      console.log("THREAD_FIND_MANY", err);
      return resultErr("THREAD_FIND_MANY", "Failed to find threads");
    }
  }

  /**
   * Retrieves a complete thread with all replies, accounts, and vote counts
   * @param id - The thread ID
   * @param maxReplyDepth - Maximum depth of nested replies to fetch (default: 10)
   * @returns A Result containing the complete thread with nested replies
   */
  public async complete(id: string, maxReplyDepth?: number): Promise<Result<ThreadComplete>> {
    try {
      const threadRow = this.db
        .prepare(
          `
        SELECT 
          t.*,
          a.id as account_id_full,
          a.upstream_id as account_upstream_id,
          a.username as account_username,
          a.email as account_email,
          a.badge as account_badge,
          a.banned as account_banned,
          a.banned_at as account_banned_at,
          a.created_at as account_created_at,
          a.updated_at as account_updated_at,
          a.deleted_at as account_deleted_at,
          a.extras as account_extras
        FROM threads t
        INNER JOIN accounts a ON t.account_id = a.id
        WHERE t.id = ?
      `,
        )
        .get(id);

      if (!threadRow) {
        return resultErr("THREAD_NOT_FOUND", `Thread not found`);
      }

      const threadVotes = this.db
        .prepare(
          `
        SELECT 
          direction,
          COUNT(*) as count
        FROM votes
        WHERE thread_id = ? AND reply_id IS NULL
        GROUP BY direction
      `,
        )
        .all(id) as Array<{ direction: string; count: number }>;

      const voteCount: VoteCount = {
        upvotes: 0,
        downvotes: 0,
        total: 0,
      };

      for (const vote of threadVotes) {
        if (vote.direction === "up") {
          voteCount.upvotes = vote.count;
        } else if (vote.direction === "down") {
          voteCount.downvotes = vote.count;
        }
      }
      voteCount.total = voteCount.upvotes - voteCount.downvotes;

      const thread = mapDbToThread(threadRow);
      const account = mapDbToAccount({
        id: (threadRow as any).account_id_full,
        upstream_id: (threadRow as any).account_upstream_id,
        username: (threadRow as any).account_username,
        email: (threadRow as any).account_email,
        badge: (threadRow as any).account_badge,
        banned: (threadRow as any).account_banned,
        banned_at: (threadRow as any).account_banned_at,
        created_at: (threadRow as any).account_created_at,
        updated_at: (threadRow as any).account_updated_at,
        deleted_at: (threadRow as any).account_deleted_at,
        extras: (threadRow as any).account_extras,
      });

      const threadWithDetails: ThreadWithDetails = {
        ...thread,
        account: maskDeletedAccount(account),
        voteCount,
      };

      const replyRows = this.db
        .prepare(
          `
        SELECT 
          r.*,
          a.id as account_id_full,
          a.upstream_id as account_upstream_id,
          a.username as account_username,
          a.email as account_email,
          a.badge as account_badge,
          a.banned as account_banned,
          a.banned_at as account_banned_at,
          a.created_at as account_created_at,
          a.updated_at as account_updated_at,
          a.deleted_at as account_deleted_at,
          a.extras as account_extras
        FROM replies r
        INNER JOIN accounts a ON r.account_id = a.id
        WHERE r.thread_id = ?
        ORDER BY r.created_at ASC
      `,
        )
        .all(id);

      const repliesWithAccounts = replyRows.map((row: any) => {
        const reply = mapDbToReply(row);
        const replyAccount = mapDbToAccount({
          id: row.account_id_full,
          upstream_id: row.account_upstream_id,
          username: row.account_username,
          email: row.account_email,
          badge: row.account_badge,
          banned: row.account_banned,
          banned_at: row.account_banned_at,
          created_at: row.account_created_at,
          updated_at: row.account_updated_at,
          deleted_at: row.account_deleted_at,
          extras: row.account_extras,
        });

        const replyVotes = this.db
          .prepare(
            `
          SELECT 
            direction,
            COUNT(*) as count
          FROM votes
          WHERE reply_id = ?
          GROUP BY direction
        `,
          )
          .all(reply.id) as Array<{ direction: string; count: number }>;

        const replyVoteCount: VoteCount = {
          upvotes: 0,
          downvotes: 0,
          total: 0,
        };

        for (const vote of replyVotes) {
          if (vote.direction === "up") {
            replyVoteCount.upvotes = vote.count;
          } else if (vote.direction === "down") {
            replyVoteCount.downvotes = vote.count;
          }
        }
        replyVoteCount.total = replyVoteCount.upvotes - replyVoteCount.downvotes;

        return {
          ...reply,
          account: replyAccount,
          voteCount: replyVoteCount,
        };
      });

      const replyTree = buildReplyTree(repliesWithAccounts, null, maxReplyDepth || 10);

      return resultOk({ thread: threadWithDetails, replies: replyTree });
    } catch (err) {
      console.log("THREAD_COMPLETE", err);
      return resultErr("THREAD_COMPLETE", "Failed to fetch complete thread");
    }
  }
}
