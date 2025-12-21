import type { Reply } from "../../schema.ts";
import { type Result, resultErr, resultOk } from "../../utils/result.ts";
import type {
  FindManyOptions,
  RepliesDataAdapter,
  RepliesFindManyOptions,
  ReplyCreate,
  ReplyUpdate,
} from "../adapter-types.ts";
import { mapDbToReply } from "../dtos.ts";
import { createId } from "../../utils/create-id.ts";

export class PostgresRepliesAdapter implements RepliesDataAdapter {
  constructor(private db: any) {}

  public async create(reply: ReplyCreate): Promise<Result<Reply>> {
    try {
      const id = createId();
      const now = Date.now();
      const extras = JSON.stringify(reply.extras || {});

      const result = await this.db.query(
        `
        INSERT INTO replies (id, thread_id, account_id, body, reply_to_id, created_at, updated_at, deleted_at, extras)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)
        RETURNING *
      `,
        [
          id,
          reply.threadId,
          reply.accountId,
          reply.body,
          reply.replyToId || null,
          now,
          now,
          extras,
        ],
      );

      return resultOk(mapDbToReply(result.rows[0]));
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
      let paramCount = 1;

      if (reply.body !== undefined) {
        updates.push(`body = $${paramCount++}`);
        values.push(reply.body);
      }

      if (extras !== undefined) {
        updates.push(`extras = $${paramCount++}`);
        values.push(extras);
      }

      updates.push(`updated_at = $${paramCount++}`);
      values.push(updatedAt);
      values.push(id);

      const result = await this.db.query(
        `
        UPDATE replies
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `,
        values,
      );

      if (result.rows.length === 0) {
        return resultErr("REPLY_NOT_FOUND", "Reply not found");
      }

      return resultOk(mapDbToReply(result.rows[0]));
    } catch (err) {
      console.log("REPLY_UPDATE", err);
      return resultErr("REPLY_UPDATE", "Failed to update reply");
    }
  }

  public async delete(replyId: string): Promise<Result<"ok">> {
    try {
      const deletedAt = Date.now();
      const result = await this.db.query(
        `
        UPDATE replies
        SET deleted_at = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
      `,
        [deletedAt, deletedAt, replyId],
      );

      if (result.rows.length === 0) {
        return resultErr("REPLY_NOT_FOUND", "Reply not found");
      }

      return resultOk("ok");
    } catch (err) {
      console.log("REPLY_DELETE", err);
      return resultErr("REPLY_DELETE", "Failed to delete reply");
    }
  }

  public async findOne(replyId: string): Promise<Result<Reply>> {
    try {
      const result = await this.db.query(
        `
        SELECT * FROM replies WHERE id = $1 AND deleted_at IS NULL
      `,
        [replyId],
      );

      if (result.rows.length === 0) {
        return resultErr("REPLY_NOT_FOUND", "Reply not found");
      }

      return resultOk(mapDbToReply(result.rows[0]));
    } catch (err) {
      console.log("REPLY_FIND_ONE", err);
      return resultErr("REPLY_FIND_ONE", "Failed to find reply");
    }
  }

  public async findMany(options?: RepliesFindManyOptions): Promise<Result<Reply[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;
      const whereClauses: string[] = ["deleted_at IS NULL"];
      const values: any[] = [];
      let paramIndex = 1;

      if (options?.where?.accountId) {
        whereClauses.push(`account_id = $${paramIndex++}`);
        values.push(options.where.accountId);
      }

      if (options?.where?.threadId) {
        whereClauses.push(`thread_id = $${paramIndex++}`);
        values.push(options.where.threadId);
      }

      if (options?.where?.replyToId !== undefined) {
        if (options.where.replyToId === null) {
          whereClauses.push("reply_to_id IS NULL");
        } else {
          whereClauses.push(`reply_to_id = $${paramIndex++}`);
          values.push(options.where.replyToId);
        }
      }

      values.push(limit, offset);
      const result = await this.db.query(
        `
        SELECT * FROM replies
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `,
        values,
      );

      const replies = result.rows.map(mapDbToReply);
      return resultOk(replies);
    } catch (err) {
      console.log("REPLY_FIND_MANY", err);
      return resultErr("REPLY_FIND_MANY", "Failed to find replies");
    }
  }

  public async findByThreadId(
    threadId: string,
    options?: FindManyOptions,
  ): Promise<Result<Reply[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      const result = await this.db.query(
        `
        SELECT * FROM replies
        WHERE thread_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [threadId, limit, offset],
      );

      const replies = result.rows.map(mapDbToReply);
      return resultOk(replies);
    } catch (err) {
      console.log("REPLY_FIND_MANY", err);
      return resultErr("REPLY_FIND_MANY", "Failed to find replies by thread");
    }
  }

  public async findByReplyToId(
    replyToId: string,
    options?: FindManyOptions,
  ): Promise<Result<Reply[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      const result = await this.db.query(
        `
        SELECT * FROM replies
        WHERE reply_to_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [replyToId, limit, offset],
      );

      const replies = result.rows.map(mapDbToReply);
      return resultOk(replies);
    } catch (err) {
      console.log("REPLY_FIND_MANY", err);
      return resultErr("REPLY_FIND_MANY", "Failed to find replies by reply_to_id");
    }
  }
}
