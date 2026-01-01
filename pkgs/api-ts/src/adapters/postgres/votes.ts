import { createId } from "../../common/create-id.ts";
import { err, type Msg, none, some } from "../../common/msg.ts";
import type {
	Vote,
	VotesDataAdapter,
	VotesFindManyOptions,
} from "../adapter-votes.ts";
import { mapDbToVote } from "../maps.ts";

export class PostgresVotesAdapter implements VotesDataAdapter {
	constructor(private db: any) {}

	public async create(opts: {
		accountId: string;
		threadId: string;
		replyId?: string | null;
		direction: "up" | "down";
	}): Promise<Msg<Vote>> {
		try {
			const { accountId, threadId, replyId = null, direction } = opts;
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

				return some(mapDbToVote(result.rows[0]));
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

				return some(mapDbToVote(result.rows[0]));
			}
		} catch (error) {
			console.log("VOTE_CREATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to create vote", metadata);
		}
	}

	public async update(
		voteId: string,
		direction: "up" | "down",
	): Promise<Msg<Vote>> {
		try {
			const updatedAt = Date.now();

			const result = await this.db.query(
				`
        UPDATE votes
        SET direction = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
      `,
				[direction, updatedAt, voteId],
			);

			if (result.rows.length === 0) {
				return none("Vote not found");
			}

			return some(mapDbToVote(result.rows[0]));
		} catch (error) {
			console.log("VOTE_UPDATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to update vote", metadata);
		}
	}

	public async delete(voteId: string): Promise<Msg<"ok">> {
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
				return none("Vote not found");
			}

			return some("ok" as const);
		} catch (error) {
			console.log("VOTE_DELETE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to delete vote", metadata);
		}
	}

	public async findOne(voteId: string): Promise<Msg<Vote>> {
		try {
			const result = await this.db.query(
				`
        SELECT * FROM votes WHERE id = $1
      `,
				[voteId],
			);

			if (result.rows.length === 0) {
				return none("Vote not found");
			}

			return some(mapDbToVote(result.rows[0]));
		} catch (error) {
			console.log("VOTE_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find vote", metadata);
		}
	}

	public async findMany(options?: VotesFindManyOptions): Promise<Msg<Vote[]>> {
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

			const whereClause =
				whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
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
			return some(votes);
		} catch (error) {
			console.log("VOTE_FIND_MANY", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find votes", metadata);
		}
	}
}
