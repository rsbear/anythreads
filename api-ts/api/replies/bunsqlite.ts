import type { Database } from "bun:sqlite";
import type { Reply } from "../../schema.ts";
import { createId } from "../../utils/create-id.ts";
import { type Result, resultErr, resultOk } from "../../utils/result.ts";
import type {
  RepliesDataAdapter,
  RepliesFindManyOptions,
  ReplyCreate,
  ReplyUpdate,
} from "../adapter-types.ts";
import { mapDbToReply } from "../dtos.ts";

export class BunSQLiteRepliesAdapter implements RepliesDataAdapter {
  constructor(private db: Database) {}

  public async create(reply: ReplyCreate): Promise<Result<Reply>> {
    try {
      const id = createId();
      const now = Date.now();
      const extras = JSON.stringify(reply.extras || {});

      const stmt = this.db.prepare(`
        INSERT INTO replies (id, thread_id, account_id, body, reply_to_id, created_at, updated_at, deleted_at, extras)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
      `);
      stmt.run(
        id,
        reply.threadId,
        reply.accountId,
        reply.body,
        reply.replyToId || null,
        now,
        now,
        extras,
      );

      const result = this.db.prepare("SELECT * FROM replies WHERE id = ?").get(id);
      return resultOk(mapDbToReply(result));
    } catch (err) {
      console.log("REPLY_CREATE", err);
      return resultErr("REPLY_CREATE", "Failed to create reply");
    }
  }

  public async update(id: string, reply: ReplyUpdate): Promise<Result<Reply>> {
    try {
      const updatedAt = Date.now();
      const extras = reply.extras ? JSON.stringify(reply.extras) : undefined;

      const updates: string[] = [];
      const values: any[] = [];

      if (reply.body !== undefined) {
        updates.push("body = ?");
        values.push(reply.body);
      }
      if (extras !== undefined) {
        updates.push("extras = ?");
        values.push(extras);
      }

      updates.push("updated_at = ?");
      values.push(updatedAt);
      values.push(id);

      const stmt = this.db.prepare(`UPDATE replies SET ${updates.join(", ")} WHERE id = ?`);
      stmt.run(...values);

      const result = this.db.prepare("SELECT * FROM replies WHERE id = ?").get(id);
      if (!result) {
        return resultErr("REPLY_NOT_FOUND", `Reply not found`);
      }
      return resultOk(mapDbToReply(result));
    } catch (err) {
      console.log("REPLY_UPDATE", err);
      return resultErr("REPLY_UPDATE", "Failed to update reply");
    }
  }

  public async delete(id: string): Promise<Result<"ok">> {
    try {
      const existing = this.db.prepare("SELECT * FROM replies WHERE id = ?").get(id);
      if (!existing) {
        return resultErr("REPLY_NOT_FOUND", "Reply not found");
      }

      const deletedAt = Date.now();
      const updatedAt = Date.now();

      const stmt = this.db.prepare(`
        UPDATE replies 
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(deletedAt, updatedAt, id);

      return resultOk("ok");
    } catch (err) {
      console.log("REPLY_DELETE", err);
      return resultErr("REPLY_DELETE", "Failed to delete reply");
    }
  }

  public async findOne(id: string): Promise<Result<Reply>> {
    try {
      const result = this.db.prepare("SELECT * FROM replies WHERE id = ?").get(id);
      if (!result) {
        return resultErr("REPLY_NOT_FOUND", `Reply not found`);
      }
      return resultOk(mapDbToReply(result));
    } catch (err) {
      console.log("REPLY_FIND_ONE", err);
      return resultErr("REPLY_FIND_ONE", "Failed to find reply");
    }
  }

  public async findMany(opts?: RepliesFindManyOptions): Promise<Result<Reply[]>> {
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

      if (opts?.where?.replyToId !== undefined) {
        if (opts.where.replyToId === null) {
          whereClauses.push("reply_to_id IS NULL");
        } else {
          whereClauses.push("reply_to_id = ?");
          values.push(opts.where.replyToId);
        }
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
      const query = `SELECT * FROM replies ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
      const results = this.db.prepare(query).all(...values);
      return resultOk(results.map(mapDbToReply));
    } catch (err) {
      console.log("REPLY_FIND_MANY", err);
      return resultErr("REPLY_FIND_MANY", "Failed to find replies");
    }
  }
}
