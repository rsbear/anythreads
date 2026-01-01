import type { Client } from "@libsql/client";
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

export class LibSQLThreadsAdapter implements ThreadsDataAdapter {
	constructor(private client: Client) {}

	public async create(thread: ThreadCreate): Promise<Msg<Thread>> {
		try {
			const id = createId();
			const now = Date.now();
			const upstreamId = thread.upstreamId || null;
			const allowReplies =
				thread.allowReplies !== undefined ? thread.allowReplies : true;
			const extras = JSON.stringify(thread.extras || {});

			await this.client.execute({
				sql: `
        INSERT INTO threads (id, account_id, upstream_id, title, body, allow_replies, created_at, updated_at, deleted_at, extras)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
      `,
				args: [
					id,
					thread.accountId,
					upstreamId,
					thread.title,
					thread.body,
					allowReplies ? 1 : 0,
					now,
					now,
					extras,
				],
			});

			const result = await this.client.execute({
				sql: "SELECT * FROM threads WHERE id = ?",
				args: [id],
			});
			return some(mapDbToThread(result.rows[0]));
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

			await this.client.execute({
				sql: `UPDATE threads SET ${updates.join(", ")} WHERE id = ?`,
				args: values,
			});

			const result = await this.client.execute({
				sql: "SELECT * FROM threads WHERE id = ?",
				args: [id],
			});
			if (result.rows.length === 0) {
				return none("Thread not found");
			}
			return some(mapDbToThread(result.rows[0]));
		} catch (error) {
			console.log("THREAD_UPDATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to update thread", metadata);
		}
	}

	public async delete(id: string): Promise<Msg<"ok">> {
		try {
			const existing = await this.client.execute({
				sql: "SELECT * FROM threads WHERE id = ?",
				args: [id],
			});
			if (existing.rows.length === 0) {
				return none("Thread not found");
			}

			const deletedAt = Date.now();
			const updatedAt = Date.now();

			await this.client.execute({
				sql: `
        UPDATE threads
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
      `,
				args: [deletedAt, updatedAt, id],
			});

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

	public async findOne(id: string): Promise<Msg<Thread>> {
		try {
			const result = await this.client.execute({
				sql: "SELECT * FROM threads WHERE id = ?",
				args: [id],
			});
			if (result.rows.length === 0) {
				return none("Thread not found");
			}
			return some(mapDbToThread(result.rows[0]));
		} catch (error) {
			console.log("THREAD_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
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
			const results = await this.client.execute({ sql: query, args: values });
			return some(results.rows.map(mapDbToThread));
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
			const threadResult = await this.client.execute({
				sql: `
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
				args: [id],
			});

			const threadRow = threadResult.rows[0];
			if (!threadRow) {
				return none("Thread not found");
			}

			const threadVotesResult = await this.client.execute({
				sql: `
        SELECT
          direction,
          COUNT(*) as count
        FROM votes
        WHERE thread_id = ? AND reply_id IS NULL
        GROUP BY direction
      `,
				args: [id],
			});

			const voteCount: VoteCount = {
				upvotes: 0,
				downvotes: 0,
				total: 0,
			};

			for (const row of threadVotesResult.rows) {
				const vote = row as unknown as { direction: string; count: number };
				if (vote.direction === "up") {
					voteCount.upvotes = Number(vote.count);
				} else if (vote.direction === "down") {
					voteCount.downvotes = Number(vote.count);
				}
			}
			voteCount.total = voteCount.upvotes - voteCount.downvotes;

			const thread = mapDbToThread(threadRow);
			const account = mapDbToAccount({
				id: threadRow.account_id_full,
				upstream_id: threadRow.account_upstream_id,
				username: threadRow.account_username,
				email: threadRow.account_email,
				badge: threadRow.account_badge,
				banned: threadRow.account_banned,
				banned_at: threadRow.account_banned_at,
				created_at: threadRow.account_created_at,
				updated_at: threadRow.account_updated_at,
				deleted_at: threadRow.account_deleted_at,
				extras: threadRow.account_extras,
			});

			const threadWithDetails: ThreadWithDetails = {
				...thread,
				account: maskDeletedAccount(account),
				voteCount,
			};

			const replyRowsResult = await this.client.execute({
				sql: `
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
				args: [id],
			});

			const repliesWithAccounts = [];
			for (const row of replyRowsResult.rows) {
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

				const replyVotesResult = await this.client.execute({
					sql: `
          SELECT
            direction,
            COUNT(*) as count
          FROM votes
          WHERE reply_id = ?
          GROUP BY direction
        `,
					args: [reply.id],
				});

				const replyVoteCount: VoteCount = {
					upvotes: 0,
					downvotes: 0,
					total: 0,
				};

				for (const vRow of replyVotesResult.rows) {
					const vote = vRow as unknown as { direction: string; count: number };
					if (vote.direction === "up") {
						replyVoteCount.upvotes = Number(vote.count);
					} else if (vote.direction === "down") {
						replyVoteCount.downvotes = Number(vote.count);
					}
				}
				replyVoteCount.total =
					replyVoteCount.upvotes - replyVoteCount.downvotes;

				repliesWithAccounts.push({
					...reply,
					account: replyAccount,
					voteCount: replyVoteCount,
				});
			}

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
