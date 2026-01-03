import type { Kysely } from "kysely";
import { createId } from "../../common/create-id.ts";
import { err, type Msg, none, some } from "../../common/msg.ts";
import type {
	RepliesDataAdapter,
	RepliesFindManyOptions,
	Reply,
	ReplyCreate,
	ReplyUpdate,
} from "../adapter-replies.ts";
import { mapDbToReply } from "../maps.ts";
import type { Database } from "./types.ts";

export class KyselyRepliesAdapter implements RepliesDataAdapter {
	constructor(private db: Kysely<Database>) {}

	public async create(reply: ReplyCreate): Promise<Msg<Reply>> {
		try {
			const id = createId();
			const now = Date.now();
			const extras = JSON.stringify(reply.extras || {});

			await this.db
				.insertInto("replies")
				.values({
					id,
					thread_id: reply.threadId,
					account_id: reply.accountId,
					body: reply.body,
					reply_to_id: reply.replyToId || null,
					created_at: now.toString(),
					updated_at: now.toString(),
					deleted_at: null,
					extras,
				})
				.execute();

			const result = await this.db
				.selectFrom("replies")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return err("Failed to retrieve created reply");
			}

			return some(mapDbToReply(result));
		} catch (error) {
			console.log("REPLY_CREATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to create reply", metadata);
		}
	}

	public async update(id: string, reply: ReplyUpdate): Promise<Msg<Reply>> {
		try {
			const updatedAt = Date.now();
			const extras = reply.extras ? JSON.stringify(reply.extras) : undefined;

			let query = this.db.updateTable("replies");

			if (reply.body !== undefined) {
				query = query.set({ body: reply.body });
			}
			if (extras !== undefined) {
				query = query.set({ extras });
			}

			query = query.set({ updated_at: updatedAt.toString() });

			await query.where("id", "=", id).execute();

			const result = await this.db
				.selectFrom("replies")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return none("Reply not found");
			}

			return some(mapDbToReply(result));
		} catch (error) {
			console.log("REPLY_UPDATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to update reply", metadata);
		}
	}

	public async delete(replyId: string): Promise<Msg<"ok">> {
		try {
			const deletedAt = Date.now();

			await this.db
				.updateTable("replies")
				.set({
					deleted_at: deletedAt.toString(),
					updated_at: deletedAt.toString(),
				})
				.where("id", "=", replyId)
				.execute();

			const result = await this.db
				.selectFrom("replies")
				.selectAll()
				.where("id", "=", replyId)
				.executeTakeFirst();

			if (!result) {
				return none("Reply not found");
			}

			return some("ok" as const);
		} catch (error) {
			console.log("REPLY_DELETE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to delete reply", metadata);
		}
	}

	public async findOne(replyId: string): Promise<Msg<Reply>> {
		try {
			const result = await this.db
				.selectFrom("replies")
				.selectAll()
				.where("id", "=", replyId)
				.where("deleted_at", "is", null)
				.executeTakeFirst();

			if (!result) {
				return none("Reply not found");
			}

			return some(mapDbToReply(result));
		} catch (error) {
			console.log("REPLY_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find reply", metadata);
		}
	}

	public async findMany(
		options?: RepliesFindManyOptions,
	): Promise<Msg<Reply[]>> {
		try {
			const limit = options?.limit || 10;
			const offset = options?.offset || 0;

			let query = this.db
				.selectFrom("replies")
				.selectAll()
				.where("deleted_at", "is", null);

			if (options?.where?.accountId) {
				query = query.where("account_id", "=", options.where.accountId);
			}

			if (options?.where?.threadId) {
				query = query.where("thread_id", "=", options.where.threadId);
			}

			if (options?.where?.replyToId !== undefined) {
				if (options.where.replyToId === null) {
					query = query.where("reply_to_id", "is", null);
				} else {
					query = query.where("reply_to_id", "=", options.where.replyToId);
				}
			}

			if (options?.order?.createdAt) {
				query = query.orderBy("created_at", options.order.createdAt);
			} else if (options?.order?.updatedAt) {
				query = query.orderBy("updated_at", options.order.updatedAt);
			} else {
				query = query.orderBy("created_at", "desc");
			}

			const results = await query.limit(limit).offset(offset).execute();

			return some(results.map(mapDbToReply));
		} catch (error) {
			console.log("REPLY_FIND_MANY", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find replies", metadata);
		}
	}
}
