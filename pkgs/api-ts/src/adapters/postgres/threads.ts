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

export class PostgresThreadsAdapter implements ThreadsDataAdapter {
	constructor(private db: any) {}

	public async create(thread: ThreadCreate): Promise<Msg<Thread>> {
		try {
			const id = createId();
			const now = Date.now();
			const upstreamId = thread.upstreamId || null;
			const extras = JSON.stringify(thread.extras || {});

			const result = await this.db.query(
				`
        INSERT INTO threads (id, account_id, upstream_id, title, body, allow_replies, created_at, updated_at, extras)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
				[
					id,
					thread.accountId,
					upstreamId,
					thread.title,
					thread.body,
					thread.allowReplies !== undefined ? thread.allowReplies : true,
					now,
					now,
					extras,
				],
			);

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
			let paramCount = 1;

			if (thread.title !== undefined) {
				updates.push(`title = $${paramCount++}`);
				values.push(thread.title);
			}

			if (thread.body !== undefined) {
				updates.push(`body = $${paramCount++}`);
				values.push(thread.body);
			}

			if (thread.allowReplies !== undefined) {
				updates.push(`allow_replies = $${paramCount++}`);
				values.push(thread.allowReplies);
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
        UPDATE threads
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `,
				values,
			);

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

	public async delete(threadId: string): Promise<Msg<"ok">> {
		try {
			const deletedAt = Date.now();
			const result = await this.db.query(
				`
        UPDATE threads
        SET deleted_at = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
      `,
				[deletedAt, deletedAt, threadId],
			);

			if (result.rows.length === 0) {
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
			const result = await this.db.query(
				`
        SELECT * FROM threads WHERE id = $1 AND deleted_at IS NULL
      `,
				[threadId],
			);

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

	public async findMany(
		options?: ThreadsFindManyOptions,
	): Promise<Msg<Thread[]>> {
		try {
			const limit = options?.limit || 10;
			const offset = options?.offset || 0;

			const result = await this.db.query(
				`
        SELECT * FROM threads
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
				[limit, offset],
			);

			const threads = result.rows.map(mapDbToThread);
			return some(threads);
		} catch (error) {
			console.log("THREAD_FIND_MANY", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find threads", metadata);
		}
	}

	public async findByUpstreamId(upstreamId: string): Promise<Msg<Thread>> {
		try {
			const result = await this.db.query(
				`
        SELECT * FROM threads WHERE upstream_id = $1 AND deleted_at IS NULL
      `,
				[upstreamId],
			);

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
			return err("Failed to find thread by upstream_id", metadata);
		}
	}

	/**
	 * Retrieves a complete thread with all replies, accounts, and vote counts
	 * @param id - The thread ID
	 * @param maxReplyDepth - Maximum depth of nested replies to fetch (default: 10)
	 * @returns A Msg containing the complete thread with nested replies
	 */
	public async complete(
		id: string,
		maxReplyDepth?: number,
	): Promise<Msg<ThreadComplete>> {
		try {
			const threadResult = await this.db.query(
				`
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
        WHERE t.id = $1
      `,
				[id],
			);

			if (threadResult.rows.length === 0) {
				return none("Thread not found");
			}

			const threadRow = threadResult.rows[0];

			const threadVotesResult = await this.db.query(
				`
        SELECT
          direction,
          COUNT(*) as count
        FROM votes
        WHERE thread_id = $1
        GROUP BY direction
      `,
				[id],
			);

			const voteCount: VoteCount = {
				upvotes: 0,
				downvotes: 0,
				total: 0,
			};

			for (const vote of threadVotesResult.rows) {
				if (vote.direction === "up") {
					voteCount.upvotes = parseInt(vote.count);
				} else if (vote.direction === "down") {
					voteCount.downvotes = parseInt(vote.count);
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

			const replyResult = await this.db.query(
				`
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
        WHERE r.thread_id = $1
        ORDER BY r.created_at ASC
      `,
				[id],
			);

			const repliesWithAccounts = await Promise.all(
				replyResult.rows.map(async (row: any) => {
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

					const replyVotesResult = await this.db.query(
						`
            SELECT
              direction,
              COUNT(*) as count
            FROM votes
            WHERE reply_id = $1
            GROUP BY direction
          `,
						[reply.id],
					);

					const replyVoteCount: VoteCount = {
						upvotes: 0,
						downvotes: 0,
						total: 0,
					};

					for (const vote of replyVotesResult.rows) {
						if (vote.direction === "up") {
							replyVoteCount.upvotes = parseInt(vote.count);
						} else if (vote.direction === "down") {
							replyVoteCount.downvotes = parseInt(vote.count);
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
