import type {
	Account,
	AccountCreateOrUpdate,
	AccountsDataAdapter,
	AccountsFindManyOptions,
	AccountUpdate,
	PersonalizedThread,
	PersonalizedThreadInput,
} from "../adapters/adapter-accounts.ts";
import type {
	RepliesDataAdapter,
	RepliesFindManyOptions,
	Reply,
	ReplyCreate,
	ReplyUpdate,
} from "../adapters/adapter-replies.ts";
import type {
	Thread,
	ThreadComplete,
	ThreadCreate,
	ThreadsDataAdapter,
	ThreadsFindManyOptions,
	ThreadUpdate,
} from "../adapters/adapter-threads.ts";
import type {
	Vote,
	VotesDataAdapter,
	VotesFindManyOptions,
} from "../adapters/adapter-votes.ts";
import type { Anythreads } from "../adapters/mod.ts";
import type { ReadContext, WriteContext } from "../common/context.ts";
import type { Msg } from "../common/msg.ts";
import type { CacheConfig, CacheStore } from "./types.ts";

/**
 * Wrap an Anythreads instance with caching behavior.
 */
export function withCache(
	adapter: Anythreads,
	config: CacheConfig,
): Anythreads {
	return {
		threads: withThreadsCache(adapter.threads, config),
		accounts: withAccountsCache(adapter.accounts, config),
		replies: withRepliesCache(adapter.replies, config),
		votes: withVotesCache(adapter.votes, config),
	};
}

function withThreadsCache(
	threads: ThreadsDataAdapter,
	config: CacheConfig,
): ThreadsDataAdapter {
	const { store, ttl: defaultTtl } = config;

	return {
		// Read operations - cache results
		async findOne(id: string, ctx?: ReadContext): Promise<Msg<Thread>> {
			if (ctx?.cache?.skip) {
				const result = await threads.findOne(id, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `thread:${id}`;
			const cached = await store.get<Msg<Thread>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await threads.findOne(id, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async findMany(
			opts?: ThreadsFindManyOptions,
			ctx?: ReadContext,
		): Promise<Msg<Thread[]>> {
			if (ctx?.cache?.skip) {
				const result = await threads.findMany(opts, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			// Generate cache key from options
			const key = `threads:list:${JSON.stringify(opts ?? {})}`;
			const cached = await store.get<Msg<Thread[]>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await threads.findMany(opts, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async complete(
			id: string,
			maxReplyDepth?: number,
			ctx?: ReadContext,
		): Promise<Msg<ThreadComplete>> {
			if (ctx?.cache?.skip) {
				const result = await threads.complete(id, maxReplyDepth, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `thread:${id}:complete:${maxReplyDepth ?? 10}`;
			const cached = await store.get<Msg<ThreadComplete>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await threads.complete(id, maxReplyDepth, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		// Write operations - invalidate cache
		async create(data: ThreadCreate, ctx?: WriteContext): Promise<Msg<Thread>> {
			const result = await threads.create(data, ctx);
			if (result.kind === "some" && config.invalidateOnWrite !== false) {
				await store.deletePattern("threads:list:*");
			}
			return result;
		},

		async update(
			id: string,
			data: ThreadUpdate,
			ctx?: WriteContext,
		): Promise<Msg<Thread>> {
			const result = await threads.update(id, data, ctx);
			if (result.kind === "some") {
				await store.delete(`thread:${id}`);
				await store.deletePattern(`thread:${id}:*`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("threads:list:*");
				}
			}
			return result;
		},

		async delete(id: string, ctx?: WriteContext): Promise<Msg<"ok">> {
			const result = await threads.delete(id, ctx);
			if (result.kind === "some") {
				await store.delete(`thread:${id}`);
				await store.deletePattern(`thread:${id}:*`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("threads:list:*");
				}
			}
			return result;
		},
	};
}

function withRepliesCache(
	replies: RepliesDataAdapter,
	config: CacheConfig,
): RepliesDataAdapter {
	const { store, ttl: defaultTtl } = config;

	return {
		async findOne(id: string, ctx?: ReadContext): Promise<Msg<Reply>> {
			if (ctx?.cache?.skip) {
				const result = await replies.findOne(id, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `reply:${id}`;
			const cached = await store.get<Msg<Reply>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await replies.findOne(id, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async findMany(
			opts?: RepliesFindManyOptions,
			ctx?: ReadContext,
		): Promise<Msg<Reply[]>> {
			if (ctx?.cache?.skip) {
				const result = await replies.findMany(opts, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `replies:list:${JSON.stringify(opts ?? {})}`;
			const cached = await store.get<Msg<Reply[]>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await replies.findMany(opts, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async create(data: ReplyCreate, ctx?: WriteContext): Promise<Msg<Reply>> {
			const result = await replies.create(data, ctx);
			if (result.kind === "some" && config.invalidateOnWrite !== false) {
				await store.deletePattern("replies:list:*");
				// Also invalidate thread complete cache since replies changed
				await store.deletePattern(`thread:${data.threadId}:complete:*`);
			}
			return result;
		},

		async update(
			id: string,
			data: ReplyUpdate,
			ctx?: WriteContext,
		): Promise<Msg<Reply>> {
			const result = await replies.update(id, data, ctx);
			if (result.kind === "some") {
				await store.delete(`reply:${id}`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("replies:list:*");
					// Invalidate thread complete caches (we don't know which thread)
					await store.deletePattern("thread:*:complete:*");
				}
			}
			return result;
		},

		async delete(id: string, ctx?: WriteContext): Promise<Msg<"ok">> {
			const result = await replies.delete(id, ctx);
			if (result.kind === "some") {
				await store.delete(`reply:${id}`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("replies:list:*");
					await store.deletePattern("thread:*:complete:*");
				}
			}
			return result;
		},
	};
}

function withAccountsCache(
	accounts: AccountsDataAdapter,
	config: CacheConfig,
): AccountsDataAdapter {
	const { store, ttl: defaultTtl } = config;

	return {
		async findOne(id: string, ctx?: ReadContext): Promise<Msg<Account>> {
			if (ctx?.cache?.skip) {
				const result = await accounts.findOne(id, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `account:${id}`;
			const cached = await store.get<Msg<Account>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await accounts.findOne(id, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async findMany(
			opts: AccountsFindManyOptions,
			ctx?: ReadContext,
		): Promise<Msg<Account[]>> {
			if (ctx?.cache?.skip) {
				const result = await accounts.findMany(opts, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `accounts:list:${JSON.stringify(opts)}`;
			const cached = await store.get<Msg<Account[]>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await accounts.findMany(opts, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async personalizedThread(
			opts: PersonalizedThreadInput,
			ctx?: ReadContext,
		): Promise<Msg<PersonalizedThread>> {
			// Don't cache personalized data by default (user-specific)
			return accounts.personalizedThread(opts, ctx);
		},

		async create(
			data: AccountCreateOrUpdate,
			ctx?: WriteContext,
		): Promise<Msg<Account>> {
			const result = await accounts.create(data, ctx);
			if (result.kind === "some" && config.invalidateOnWrite !== false) {
				await store.deletePattern("accounts:list:*");
			}
			return result;
		},

		async update(
			id: string,
			data: AccountUpdate,
			ctx?: WriteContext,
		): Promise<Msg<Account>> {
			const result = await accounts.update(id, data, ctx);
			if (result.kind === "some") {
				await store.delete(`account:${id}`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("accounts:list:*");
				}
			}
			return result;
		},

		async delete(id: string, ctx?: WriteContext): Promise<Msg<Account>> {
			const result = await accounts.delete(id, ctx);
			if (result.kind === "some") {
				await store.delete(`account:${id}`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("accounts:list:*");
				}
			}
			return result;
		},

		async ban(
			id: string,
			until: Date | null,
			ctx?: WriteContext,
		): Promise<Msg<Account>> {
			const result = await accounts.ban(id, until, ctx);
			if (result.kind === "some") {
				await store.delete(`account:${id}`);
			}
			return result;
		},

		async unban(id: string, ctx?: WriteContext): Promise<Msg<Account>> {
			const result = await accounts.unban(id, ctx);
			if (result.kind === "some") {
				await store.delete(`account:${id}`);
			}
			return result;
		},
	};
}

function withVotesCache(
	votes: VotesDataAdapter,
	config: CacheConfig,
): VotesDataAdapter {
	const { store, ttl: defaultTtl } = config;

	return {
		async findOne(id: string, ctx?: ReadContext): Promise<Msg<Vote>> {
			if (ctx?.cache?.skip) {
				const result = await votes.findOne(id, ctx);
				return { ...result, metadata: { ...result.metadata, cacheHit: false } };
			}

			const key = `vote:${id}`;
			const cached = await store.get<Msg<Vote>>(key);
			if (cached) {
				return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
			}

			const result = await votes.findOne(id, ctx);
			if (result.kind === "some") {
				const cacheTtl = ctx?.cache?.ttl ?? defaultTtl;
				await store.set(key, result, cacheTtl);
				return {
					...result,
					metadata: { ...result.metadata, cacheHit: false, cacheTtl },
				};
			}
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async findMany(
			opts?: VotesFindManyOptions,
			ctx?: ReadContext,
		): Promise<Msg<Vote[]>> {
			// Don't cache vote lists - they change frequently
			const result = await votes.findMany(opts, ctx);
			return { ...result, metadata: { ...result.metadata, cacheHit: false } };
		},

		async create(
			opts: {
				accountId: string;
				threadId: string;
				replyId?: string | null;
				direction: "up" | "down";
			},
			ctx?: WriteContext,
		): Promise<Msg<Vote>> {
			const result = await votes.create(opts, ctx);
			if (result.kind === "some" && config.invalidateOnWrite !== false) {
				// Invalidate thread complete cache since vote counts changed
				await store.deletePattern(`thread:${opts.threadId}:complete:*`);
			}
			return result;
		},

		async update(
			voteId: string,
			direction: "up" | "down",
			ctx?: WriteContext,
		): Promise<Msg<Vote>> {
			const result = await votes.update(voteId, direction, ctx);
			if (result.kind === "some") {
				await store.delete(`vote:${voteId}`);
				if (config.invalidateOnWrite !== false) {
					// Invalidate all thread complete caches (we don't know which thread)
					await store.deletePattern("thread:*:complete:*");
				}
			}
			return result;
		},

		async delete(id: string, ctx?: WriteContext): Promise<Msg<"ok">> {
			const result = await votes.delete(id, ctx);
			if (result.kind === "some") {
				await store.delete(`vote:${id}`);
				if (config.invalidateOnWrite !== false) {
					await store.deletePattern("thread:*:complete:*");
				}
			}
			return result;
		},
	};
}
