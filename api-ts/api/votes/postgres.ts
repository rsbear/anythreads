import type { Vote } from "../../schema.ts";
import { createId } from "../../utils/create-id.ts";
import { type Result, resultErr, resultOk } from "../../utils/result.ts";
import type { FindManyOptions, VotesDataAdapter, VotesFindManyOptions } from "../adapter-types.ts";
import { mapDbToVote } from "../dtos.ts";

export class PostgresVotesAdapter implements VotesDataAdapter {
  constructor(private db: any) {}

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
      const whereClauses = ["account_id = $1", "thread_id = $2"];
      const whereValues: any[] = [accountId, threadId];
      let paramCount = 3;

      if (replyId) {
        whereClauses.push(`reply_id = $${paramCount++}`);
        whereValues.push(replyId);
      } else {
        whereClauses.push("reply_id IS NULL");
      }

      const existingVoteResult = await this.db.query(
        `SELECT * FROM votes WHERE ${whereClauses.join(" AND ")}`,
        whereValues,
      );

      if (existingVoteResult.rows.length > 0) {
        const existingVote = existingVoteResult.rows[0];
        const updatedAt = Date.now();

        const result = await this.db.query(
          `
          UPDATE votes 
          SET direction = $1, updated_at = $2
          WHERE id = $3
          RETURNING *
        `,
          [direction, updatedAt, existingVote.id],
        );

        return resultOk(mapDbToVote(result.rows[0]));
      } else {
        const id = createId();
        const now = Date.now();

        const result = await this.db.query(
          `
          INSERT INTO votes (id, thread_id, account_id, reply_id, direction, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
          [id, threadId, accountId, replyId, direction, now, now],
        );

        return resultOk(mapDbToVote(result.rows[0]));
      }
    } catch (err) {
      console.log("VOTE_CREATE", err);
      return resultErr("VOTE_CREATE", "Failed to create or update vote");
    }
  }

  public async delete(voteId: string): Promise<Result<"ok">> {
    try {
      const result = await this.db.query(
        `
        DELETE FROM votes
        WHERE id = $1
        RETURNING *
      `,
        [voteId],
      );

      if (result.rows.length === 0) {
        return resultErr("VOTE_NOT_FOUND", "Vote not found");
      }

      return resultOk("ok");
    } catch (err) {
      console.log("VOTE_DELETE", err);
      return resultErr("VOTE_DELETE", "Failed to delete vote");
    }
  }

  public async findOne(voteId: string): Promise<Result<Vote>> {
    try {
      const result = await this.db.query(
        `
        SELECT * FROM votes WHERE id = $1
      `,
        [voteId],
      );

      if (result.rows.length === 0) {
        return resultErr("VOTE_NOT_FOUND", "Vote not found");
      }

      return resultOk(mapDbToVote(result.rows[0]));
    } catch (err) {
      console.log("VOTE_FIND_ONE", err);
      return resultErr("VOTE_FIND_ONE", "Failed to find vote");
    }
  }

  public async findMany(options?: VotesFindManyOptions): Promise<Result<Vote[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;
      const whereClauses: string[] = [];
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

      if (options?.where?.replyId !== undefined) {
        if (options.where.replyId === null) {
          whereClauses.push("reply_id IS NULL");
        } else {
          whereClauses.push(`reply_id = $${paramIndex++}`);
          values.push(options.where.replyId);
        }
      }

      if (options?.where?.direction) {
        whereClauses.push(`direction = $${paramIndex++}`);
        values.push(options.where.direction);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
      values.push(limit, offset);

      const result = await this.db.query(
        `
        SELECT * FROM votes
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `,
        values,
      );

      const votes = result.rows.map(mapDbToVote);
      return resultOk(votes);
    } catch (err) {
      console.log("VOTE_FIND_MANY", err);
      return resultErr("VOTE_FIND_MANY", "Failed to find votes");
    }
  }

  public async findByThreadId(
    threadId: string,
    options?: FindManyOptions,
  ): Promise<Result<Vote[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      const result = await this.db.query(
        `
        SELECT * FROM votes
        WHERE thread_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [threadId, limit, offset],
      );

      const votes = result.rows.map(mapDbToVote);
      return resultOk(votes);
    } catch (err) {
      console.log("VOTE_FIND_MANY", err);
      return resultErr("VOTE_FIND_MANY", "Failed to find votes by thread");
    }
  }

  public async findByReplyId(replyId: string, options?: FindManyOptions): Promise<Result<Vote[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      const result = await this.db.query(
        `
        SELECT * FROM votes
        WHERE reply_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [replyId, limit, offset],
      );

      const votes = result.rows.map(mapDbToVote);
      return resultOk(votes);
    } catch (err) {
      console.log("VOTE_FIND_MANY", err);
      return resultErr("VOTE_FIND_MANY", "Failed to find votes by reply");
    }
  }

  public async findByAccountId(
    accountId: string,
    options?: FindManyOptions,
  ): Promise<Result<Vote[]>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      const result = await this.db.query(
        `
        SELECT * FROM votes
        WHERE account_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [accountId, limit, offset],
      );

      const votes = result.rows.map(mapDbToVote);
      return resultOk(votes);
    } catch (err) {
      console.log("VOTE_FIND_MANY", err);
      return resultErr("VOTE_FIND_MANY", "Failed to find votes by account");
    }
  }
}
