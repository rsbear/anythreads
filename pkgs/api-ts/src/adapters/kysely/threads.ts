import type { Kysely } from "kysely";
import { createId } from "../../common/create-id.ts";
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
import {
	buildReplyTree,
	mapDbToAccount,
	mapDbToReply,
	mapDbToThread,
	maskDeletedAccount,
} from "../maps.ts";
import type { Database } from "./types.ts";

export class KyselyThreadsAdapter implements ThreadsDataAdapter {
	constructor(private db: Kysely<Database>) {}

	public async create(thread: ThreadCreate): Promise<Msg<Thread>> {
		try {
			const id = createId();
			const now = Date.now();
			const upstreamId = thread.upstreamId || null;
			const extras = JSON.stringify(thread.extras || {});

			await this.db
				.insertInto("threads")
				.values({
					id,
					account_id: thread.accountId,
					upstream_id: upstreamId,
					title: thread.title,
					body: thread.body,
					allow_replies:
						thread.allowReplies !== undefined
							? thread.allowReplies
								? 1
								: 0
							: 1,
					created_at: now.toString(),
					updated_at: now.toString(),
					extras,
				})
				.execute();

			const result = await this.db
				.selectFrom("threads")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return err("Failed to retrieve created thread");
			}

			return some(mapDbToThread(result));
		} catch (error) {
			console.log("THREAD_CREATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to create thread", metadata);
		}
	}

	public async update(id: string, thread: ThreadUpdate): Promise<Msg<Thread>> {
		try {
			const updatedAt = Date.now();
			const extras = thread.extras ? JSON.stringify(thread.extras) : undefined;

			let query = this.db.updateTable("threads");

			if (thread.title !== undefined) {
				query = query.set({ title: thread.title });
			}
			if (thread.body !== undefined) {
				query = query.set({ body: thread.body });
			}
			if (thread.allowReplies !== undefined) {
				query = query.set({ allow_replies: thread.allowReplies ? 1 : 0 });
			}
			if (extras !== undefined) {
				query = query.set({ extras });
			}

			query = query.set({ updated_at: updatedAt.toString() });

			await query.where("id", "=", id).execute();

			const result = await this.db
				.selectFrom("threads")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return none("Thread not found");
			}

			return some(mapDbToThread(result));
		} catch (error) {
			console.log("THREAD_UPDATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to update thread", metadata);
		}
	}

	public async delete(threadId: string): Promise<Msg<"ok">> {
		try {
			const deletedAt = Date.now();

			await this.db
				.updateTable("threads")
				.set({
					deleted_at: deletedAt.toString(),
					updated_at: deletedAt.toString(),
				})
				.where("id", "=", threadId)
				.execute();

			const result = await this.db
				.selectFrom("threads")
				.selectAll()
				.where("id", "=", threadId)
				.executeTakeFirst();

			if (!result) {
				return none("Thread not found");
			}

			return some("ok" as const);
		} catch (error) {
			console.log("THREAD_DELETE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to delete thread", metadata);
		}
	}

	public async findOne(threadId: string): Promise<Msg<Thread>> {
		try {
			const result = await this.db
				.selectFrom("threads")
				.selectAll()
				.where("id", "=", threadId)
				.where("deleted_at", "is", null)
				.executeTakeFirst();

			if (!result) {
				return none("Thread not found");
			}

			return some(mapDbToThread(result));
		} catch (error) {
			console.log("THREAD_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find thread", metadata);
		}
	}

	public async findMany(
		options?: ThreadsFindManyOptions,
	): Promise<Msg<Thread[]>> {
		try {
			const limit = options?.limit || 10;
			const offset = options?.offset || 0;

			let query = this.db
				.selectFrom("threads")
				.selectAll()
				.where("deleted_at", "is", null);

			if (options?.where?.accountId) {
				query = query.where("account_id", "=", options.where.accountId);
			}

			if (options?.where?.upstreamId) {
				query = query.where("upstream_id", "=", options.where.upstreamId);
			}

			if (options?.order?.createdAt) {
				query = query.orderBy("created_at", options.order.createdAt);
			} else if (options?.order?.updatedAt) {
				query = query.orderBy("updated_at", options.order.updatedAt);
			} else {
				query = query.orderBy("created_at", "desc");
			}

			const results = await query.limit(limit).offset(offset).execute();

			return some(results.map(mapDbToThread));
		} catch (error) {
			console.log("THREAD_FIND_MANY", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find threads", metadata);
		}
	}

	public async complete(
		id: string,
		maxReplyDepth?: number,
	): Promise<Msg<ThreadComplete>> {
		try {
			const threadResult = await this.db
				.selectFrom("threads as t")
				.innerJoin("accounts as a", "t.account_id", "a.id")
				.select([
					"t.id",
					"t.account_id",
					"t.upstream_id",
					"t.title",
					"t.body",
					"t.allow_replies",
					"t.created_at",
					"t.updated_at",
					"t.deleted_at",
					"t.extras",
					"a.id as account_id_full",
					"a.upstream_id as account_upstream_id",
					"a.username as account_username",
					"a.email as account_email",
					"a.avatar as account_avatar",
					"a.badge as account_badge",
					"a.banned as account_banned",
					"a.banned_at as account_banned_at",
					"a.created_at as account_created_at",
					"a.updated_at as account_updated_at",
					"a.deleted_at as account_deleted_at",
					"a.extras as account_extras",
				])
				.where("t.id", "=", id)
				.executeTakeFirst();

			if (!threadResult) {
				return none("Thread not found");
			}

			const threadVotesResult = await this.db
				.selectFrom("votes")
				.select(["direction", (eb) => eb.fn.count("id").as("count")])
				.where("thread_id", "=", id)
				.where("reply_id", "is", null)
				.groupBy("direction")
				.execute();

			const voteCount: VoteCount = {
				upvotes: 0,
				downvotes: 0,
				total: 0,
			};

			for (const vote of threadVotesResult) {
				const count = Number(vote.count);
				if (vote.direction === "up") {
					voteCount.upvotes = count;
				} else if (vote.direction === "down") {
					voteCount.downvotes = count;
				}
			}
			voteCount.total = voteCount.upvotes - voteCount.downvotes;

			const thread = mapDbToThread(threadResult);
			const account = mapDbToAccount({
				id: threadResult.account_id_full,
				upstream_id: threadResult.account_upstream_id,
				username: threadResult.account_username,
				email: threadResult.account_email,
				avatar: threadResult.account_avatar,
				badge: threadResult.account_badge,
				banned: threadResult.account_banned,
				banned_at: threadResult.account_banned_at,
				created_at: threadResult.account_created_at,
				updated_at: threadResult.account_updated_at,
				deleted_at: threadResult.account_deleted_at,
				extras: threadResult.account_extras,
			});

			const threadWithDetails: ThreadWithDetails = {
				...thread,
				account: maskDeletedAccount(account),
				voteCount,
			};

			const replyResult = await this.db
				.selectFrom("replies as r")
				.innerJoin("accounts as a", "r.account_id", "a.id")
				.select([
					"r.id",
					"r.thread_id",
					"r.account_id",
					"r.body",
					"r.reply_to_id",
					"r.created_at",
					"r.updated_at",
					"r.deleted_at",
					"r.extras",
					"a.id as account_id_full",
					"a.upstream_id as account_upstream_id",
					"a.username as account_username",
					"a.email as account_email",
					"a.avatar as account_avatar",
					"a.badge as account_badge",
					"a.banned as account_banned",
					"a.banned_at as account_banned_at",
					"a.created_at as account_created_at",
					"a.updated_at as account_updated_at",
					"a.deleted_at as account_deleted_at",
					"a.extras as account_extras",
				])
				.where("r.thread_id", "=", id)
				.orderBy("r.created_at", "asc")
				.execute();

			const repliesWithAccounts = await Promise.all(
				replyResult.map(async (row) => {
					const reply = mapDbToReply(row);
					const replyAccount = mapDbToAccount({
						id: row.account_id_full,
						upstream_id: row.account_upstream_id,
						username: row.account_username,
						email: row.account_email,
						avatar: row.account_avatar,
						badge: row.account_badge,
						banned: row.account_banned,
						banned_at: row.account_banned_at,
						created_at: row.account_created_at,
						updated_at: row.account_updated_at,
						deleted_at: row.account_deleted_at,
						extras: row.account_extras,
					});

					const replyVotesResult = await this.db
						.selectFrom("votes")
						.select(["direction", (eb) => eb.fn.count("id").as("count")])
						.where("reply_id", "=", reply.id)
						.groupBy("direction")
						.execute();

					const replyVoteCount: VoteCount = {
						upvotes: 0,
						downvotes: 0,
						total: 0,
					};

					for (const vote of replyVotesResult) {
						const count = Number(vote.count);
						if (vote.direction === "up") {
							replyVoteCount.upvotes = count;
						} else if (vote.direction === "down") {
							replyVoteCount.downvotes = count;
						}
					}
					replyVoteCount.total =
						replyVoteCount.upvotes - replyVoteCount.downvotes;

					return {
						...reply,
						account: replyAccount,
						voteCount: replyVoteCount,
					};
				}),
			);

			const replyTree = buildReplyTree(
				repliesWithAccounts,
				null,
				maxReplyDepth || 10,
			);

			return some({ thread: threadWithDetails, replies: replyTree });
		} catch (error) {
			console.log("THREAD_COMPLETE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to fetch complete thread", metadata);
		}
	}
}
