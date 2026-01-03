import type { Kysely } from "kysely";
import { createId } from "../../common/create-id.ts";
import { err, type Msg, none, some } from "../../common/msg.ts";
import type {
	Vote,
	VotesDataAdapter,
	VotesFindManyOptions,
} from "../adapter-votes.ts";
import { mapDbToVote } from "../maps.ts";
import type { Database } from "./types.ts";

export class KyselyVotesAdapter implements VotesDataAdapter {
	constructor(private db: Kysely<Database>) {}

	public async create(opts: {
		accountId: string;
		threadId: string;
		replyId?: string | null;
		direction: "up" | "down";
	}): Promise<Msg<Vote>> {
		try {
			const { accountId, threadId, replyId = null, direction } = opts;

			let query = this.db
				.selectFrom("votes")
				.selectAll()
				.where("account_id", "=", accountId)
				.where("thread_id", "=", threadId);

			if (replyId) {
				query = query.where("reply_id", "=", replyId);
			} else {
				query = query.where("reply_id", "is", null);
			}

			const existingVote = await query.executeTakeFirst();

			if (existingVote) {
				const updatedAt = Date.now();

				await this.db
					.updateTable("votes")
					.set({
						direction,
						updated_at: updatedAt.toString(),
					})
					.where("id", "=", existingVote.id)
					.execute();

				const result = await this.db
					.selectFrom("votes")
					.selectAll()
					.where("id", "=", existingVote.id)
					.executeTakeFirst();

				if (!result) {
					return err("Failed to retrieve updated vote");
				}

				return some(mapDbToVote(result));
			}

			const id = createId();
			const now = Date.now();

			await this.db
				.insertInto("votes")
				.values({
					id,
					thread_id: threadId,
					account_id: accountId,
					reply_id: replyId,
					direction,
					created_at: now.toString(),
					updated_at: now.toString(),
				})
				.execute();

			const result = await this.db
				.selectFrom("votes")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return err("Failed to retrieve created vote");
			}

			return some(mapDbToVote(result));
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

			await this.db
				.updateTable("votes")
				.set({
					direction,
					updated_at: updatedAt.toString(),
				})
				.where("id", "=", voteId)
				.execute();

			const result = await this.db
				.selectFrom("votes")
				.selectAll()
				.where("id", "=", voteId)
				.executeTakeFirst();

			if (!result) {
				return none("Vote not found");
			}

			return some(mapDbToVote(result));
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
			const result = await this.db
				.deleteFrom("votes")
				.where("id", "=", voteId)
				.executeTakeFirst();

			if (result.numDeletedRows === 0n) {
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
			const result = await this.db
				.selectFrom("votes")
				.selectAll()
				.where("id", "=", voteId)
				.executeTakeFirst();

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

	public async findMany(options?: VotesFindManyOptions): Promise<Msg<Vote[]>> {
		try {
			const limit = options?.limit || 10;
			const offset = options?.offset || 0;

			let query = this.db.selectFrom("votes").selectAll();

			if (options?.where?.accountId) {
				query = query.where("account_id", "=", options.where.accountId);
			}

			if (options?.where?.threadId) {
				query = query.where("thread_id", "=", options.where.threadId);
			}

			if (options?.where?.replyId !== undefined) {
				if (options.where.replyId === null) {
					query = query.where("reply_id", "is", null);
				} else {
					query = query.where("reply_id", "=", options.where.replyId);
				}
			}

			if (options?.where?.direction) {
				query = query.where("direction", "=", options.where.direction);
			}

			if (options?.order?.createdAt) {
				query = query.orderBy("created_at", options.order.createdAt);
			} else if (options?.order?.updatedAt) {
				query = query.orderBy("updated_at", options.order.updatedAt);
			} else {
				query = query.orderBy("created_at", "desc");
			}

			const results = await query.limit(limit).offset(offset).execute();

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
