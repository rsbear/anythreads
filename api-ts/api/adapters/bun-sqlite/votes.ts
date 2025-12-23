import type { Database } from "bun:sqlite";
import type { Vote } from "../../schema.ts";
import { createId } from "../../utils/create-id.ts";
import { type Result, resultErr, resultOk } from "../../utils/result.ts";
import type { VotesDataAdapter, VotesFindManyOptions } from "../adapter-types.ts";
import { mapDbToVote } from "../dtos.ts";

export class BunSQLiteVotesAdapter implements VotesDataAdapter {
  constructor(private db: Database) {}

  public async voteUpThread(accountId: string, threadId: string): Promise<Result<Vote>> {
    return this.createOrUpdateVote(accountId, threadId, null, "up");
  }

  public async voteDownThread(accountId: string, threadId: string): Promise<Result<Vote>> {
    return this.createOrUpdateVote(accountId, threadId, null, "down");
  }

  public async voteUpReply(
    accountId: string,
    threadId: string,
    replyId: string,
  ): Promise<Result<Vote>> {
    return this.createOrUpdateVote(accountId, threadId, replyId, "up");
  }

  public async voteDownReply(
    accountId: string,
    threadId: string,
    replyId: string,
  ): Promise<Result<Vote>> {
    return this.createOrUpdateVote(accountId, threadId, replyId, "down");
  }

  private async createOrUpdateVote(
    accountId: string,
    threadId: string,
    replyId: string | null,
    direction: "up" | "down",
  ): Promise<Result<Vote>> {
    try {
      const whereClauses = ["account_id = ?", "thread_id = ?"];
      const whereValues: any[] = [accountId, threadId];

      if (replyId) {
        whereClauses.push("reply_id = ?");
        whereValues.push(replyId);
      } else {
        whereClauses.push("reply_id IS NULL");
      }

      const existingVote = this.db
        .prepare(`SELECT * FROM votes WHERE ${whereClauses.join(" AND ")}`)
        .get(...whereValues) as any;

      if (existingVote) {
        const updatedAt = Date.now();
        const stmt = this.db.prepare(`
          UPDATE votes 
          SET direction = ?, updated_at = ?
          WHERE id = ?
        `);
        stmt.run(direction, updatedAt, existingVote.id);

        const result = this.db.prepare("SELECT * FROM votes WHERE id = ?").get(existingVote.id);
        return resultOk(mapDbToVote(result));
      } else {
        const id = createId();
        const now = Date.now();

        const stmt = this.db.prepare(`
          INSERT INTO votes (id, thread_id, account_id, reply_id, direction, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, threadId, accountId, replyId, direction, now, now);

        const result = this.db.prepare("SELECT * FROM votes WHERE id = ?").get(id);
        return resultOk(mapDbToVote(result));
      }
    } catch (err) {
      console.log("VOTE_CREATE", err);
      return resultErr("VOTE_CREATE", "Failed to create or update vote");
    }
  }

  public async delete(id: string): Promise<Result<"ok">> {
    try {
      const stmt = this.db.prepare("DELETE FROM votes WHERE id = ?");
      const result = stmt.run(id);

      if (result.changes === 0) {
        return resultErr("VOTE_NOT_FOUND", "Vote not found");
      }
      return resultOk("ok");
    } catch (err) {
      console.log("VOTE_DELETE", err);
      return resultErr("VOTE_DELETE", "Failed to delete vote");
    }
  }

  public async findOne(id: string): Promise<Result<Vote>> {
    try {
      const result = this.db.prepare("SELECT * FROM votes WHERE id = ?").get(id);
      if (!result) {
        return resultErr("VOTE_NOT_FOUND", `Vote not found`);
      }
      return resultOk(mapDbToVote(result));
    } catch (err) {
      console.log("VOTE_FIND_ONE", err);
      return resultErr("VOTE_FIND_ONE", "Failed to find vote");
    }
  }

  public async findMany(opts?: VotesFindManyOptions): Promise<Result<Vote[]>> {
    try {
      const limit = opts?.limit || 50;
      const offset = opts?.offset || 0;
      const whereClauses: string[] = [];
      const values: any[] = [];

      if (opts?.where?.accountId) {
        whereClauses.push("account_id = ?");
        values.push(opts.where.accountId);
      }

      if (opts?.where?.threadId) {
        whereClauses.push("thread_id = ?");
        values.push(opts.where.threadId);
      }

      if (opts?.where?.replyId !== undefined) {
        if (opts.where.replyId === null) {
          whereClauses.push("reply_id IS NULL");
        } else {
          whereClauses.push("reply_id = ?");
          values.push(opts.where.replyId);
        }
      }

      if (opts?.where?.direction) {
        whereClauses.push("direction = ?");
        values.push(opts.where.direction);
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
      const query = `SELECT * FROM votes ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
      const results = this.db.prepare(query).all(...values);
      return resultOk(results.map(mapDbToVote));
    } catch (err) {
      console.log("VOTE_FIND_MANY", err);
      return resultErr("VOTE_FIND_MANY", "Failed to find votes");
    }
  }
}
