import { createId } from "../../common/create-id.ts";
import {
  buildReplyTree,
  mapDbToAccount,
  mapDbToReply,
  mapDbToThread,
  maskDeletedAccount,
} from "../maps.ts";
import { err, type Msg, none, some } from "../../common/msg.ts";

import type {
  Thread,
  ThreadComplete,
  ThreadCreate,
  ThreadsDataAdapter,
  ThreadsFindManyOptions,
  ThreadUpdate,
  ThreadWithDetails,
  VoteCount,
} from "../adapter-threads.ts";

export class SQLite3ThreadsAdapter implements ThreadsDataAdapter {
  constructor(private db: any) {}

  public async create(thread: ThreadCreate): Promise<Msg<Thread>> {
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
      return some(mapDbToThread(result));
    } catch (error) {
      console.log("THREAD_CREATE", error);
      const metadata =
        error instanceof Error ? { error: error.message } : { error: String(error) };
      return err("Failed to create thread", metadata);
    }
  }

  public async update(id: string, thread: ThreadUpdate): Promise<Msg<Thread>> {
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

      const stmt = this.db.prepare(
        `UPDATE threads SET ${updates.join(", ")} WHERE id = ?`,
      );
      stmt.run(...values);

      const result = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      if (!result) {
        return none("Thread not found");
      }
      return some(mapDbToThread(result));
    } catch (error) {
      console.log("THREAD_UPDATE", error);
      const metadata =
        error instanceof Error ? { error: error.message } : { error: String(error) };
      return err("Failed to update thread", metadata);
    }
  }

  public async delete(id: string): Promise<Msg<"ok">> {
    try {
      const existing = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      if (!existing) {
        return none("Thread not found");
      }

      const deletedAt = Date.now();
      const updatedAt = Date.now();

      const stmt = this.db.prepare(`
        UPDATE threads
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(deletedAt, updatedAt, id);

      return some("ok" as const);
    } catch (error) {
      console.log("THREAD_DELETE", error);
      const metadata =
        error instanceof Error ? { error: error.message } : { error: String(error) };
      return err("Failed to delete thread", metadata);
    }
  }

  public async findOne(id: string): Promise<Msg<Thread>> {
    try {
      const result = this.db.prepare("SELECT * FROM threads WHERE id = ?").get(id);
      if (!result) {
        return none("Thread not found");
      }
      return some(mapDbToThread(result));
    } catch (error) {
      console.log("THREAD_FIND_ONE", error);
      const metadata =
        error instanceof Error ? { error: error.message } : { error: String(error) };
      return err("Failed to find thread", metadata);
    }
  }

  public async findMany(opts?: ThreadsFindManyOptions): Promise<Msg<Thread[]>> {
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

      const whereClause =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

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
      return some((results as any[]).map(mapDbToThread));
    } catch (error) {
      console.log("THREAD_FIND_MANY", error);
      const metadata =
        error instanceof Error ? { error: error.message } : { error: String(error) };
      return err("Failed to find threads", metadata);
    }
  }

  public async complete(
    id: string,
    maxReplyDepth?: number,
  ): Promise<Msg<ThreadComplete>> {
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
        return none("Thread not found");
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

      const repliesWithAccounts = (replyRows as any[]).map((row: any) => {
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

      return some({ thread: threadWithDetails, replies: replyTree });
    } catch (error) {
      console.log("THREAD_COMPLETE", error);
      const metadata =
        error instanceof Error ? { error: error.message } : { error: String(error) };
      return err("Failed to fetch complete thread", metadata);
    }
  }
}
