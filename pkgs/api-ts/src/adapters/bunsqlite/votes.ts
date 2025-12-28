import type { Database } from "bun:sqlite";
import { createId } from "../../common/create-id.ts";
import { err, type Msg, none, some } from "../../common/msg.ts";
import type {
	Vote,
	VotesDataAdapter,
	VotesFindManyOptions,
} from "../adapter-votes.ts";
import { mapDbToVote } from "../maps.ts";

export class BunSQLiteVotesAdapter implements VotesDataAdapter {
	constructor(private db: Database) {}

	public async voteUpThread(
		accountId: string,
		threadId: string,
	): Promise<Msg<Vote>> {
		return this.createOrUpdateVote(accountId, threadId, null, "up");
	}

	public async voteDownThread(
		accountId: string,
		threadId: string,
	): Promise<Msg<Vote>> {
		return this.createOrUpdateVote(accountId, threadId, null, "down");
	}

	public async voteUpReply(
		accountId: string,
		threadId: string,
		replyId: string,
	): Promise<Msg<Vote>> {
		return this.createOrUpdateVote(accountId, threadId, replyId, "up");
	}

	public async voteDownReply(
		accountId: string,
		threadId: string,
		replyId: string,
	): Promise<Msg<Vote>> {
		return this.createOrUpdateVote(accountId, threadId, replyId, "down");
	}

	private async createOrUpdateVote(
		accountId: string,
		threadId: string,
		replyId: string | null,
		direction: "up" | "down",
	): Promise<Msg<Vote>> {
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

				const result = this.db
					.prepare("SELECT * FROM votes WHERE id = ?")
					.get(existingVote.id);
				return some(mapDbToVote(result));
			} else {
				const id = createId();
				const now = Date.now();

				const stmt = this.db.prepare(`
          INSERT INTO votes (id, thread_id, account_id, reply_id, direction, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
				stmt.run(id, threadId, accountId, replyId, direction, now, now);

				const result = this.db
					.prepare("SELECT * FROM votes WHERE id = ?")
					.get(id);
				return some(mapDbToVote(result));
			}
		} catch (error) {
			console.log("VOTE_CREATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to create or update vote", metadata);
		}
	}

	public async delete(id: string): Promise<Msg<"ok">> {
		try {
			const stmt = this.db.prepare("DELETE FROM votes WHERE id = ?");
			const result = stmt.run(id);

			if (result.changes === 0) {
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

	public async findOne(id: string): Promise<Msg<Vote>> {
		try {
			const result = this.db
				.prepare("SELECT * FROM votes WHERE id = ?")
				.get(id);
			if (!result) {
				return none("Vote not found");
			}
			return some(mapDbToVote(result));
		} catch (error) {
			console.log("VOTE_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find vote", metadata);
		}
	}

	public async findMany(opts?: VotesFindManyOptions): Promise<Msg<Vote[]>> {
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
			const query = `SELECT * FROM votes ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
			const results = this.db.prepare(query).all(...values);
			return some(results.map(mapDbToVote));
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
