import type { Anythreads } from "./adapters/mod.ts";
import type { CacheConfig } from "./cache/types.ts";
import { withCache } from "./cache/wrapper.ts";
import type { ModerationConfig } from "./moderation/types.ts";
import { withModeration } from "./moderation/wrapper.ts";

export {
	bunSqliteAdapter,
	createBunSQLiteAdapter,
} from "./adapters/bunsqlite/mod.ts";
export { createFetchAdapter, fetchAdapter } from "./adapters/fetch/mod.ts";
// Re-export adapter factories
export { createLibSQLAdapter, libsqlAdapter } from "./adapters/libsql/mod.ts";
// Re-export types
export type { Anythreads } from "./adapters/mod.ts";
export {
	createPostgresAdapter,
	postgresAdapter,
} from "./adapters/postgres/mod.ts";
// Re-export cache stores
export { memoryCache } from "./cache/stores/memory.ts";
export type { CacheConfig, CacheStore } from "./cache/types.ts";
export type {
	CacheContext,
	ModerationContext,
	ReadContext,
	WriteContext,
} from "./common/context.ts";
export type { Msg, MsgMetadata } from "./common/msg.ts";
export { err, isErr, isNone, isSome, none, some } from "./common/msg.ts";
export type { ModerationConfig } from "./moderation/types.ts";

/**
 * Options for creating an Anythreads instance.
 */
export interface CreateAnythreadsOptions {
	/** The database adapter (use a factory like libsqlAdapter, postgresAdapter, etc.) */
	adapter: Anythreads;
	/** AI moderation configuration (optional) */
	moderation?: ModerationConfig;
	/** Cache configuration (optional) */
	cache?: CacheConfig;
}

/**
 * Create an Anythreads instance with optional moderation and caching.
 *
 * @example
 * ```typescript
 * import { createAnythreads, libsqlAdapter, memoryCache } from "@anythreads/api";
 * import { openai } from "@ai-sdk/openai";
 *
 * const api = createAnythreads({
 *   adapter: libsqlAdapter(client),
 *   moderation: {
 *     provider: openai("gpt-4o-mini"),
 *   },
 *   cache: memoryCache({ ttl: 60_000 }),
 * });
 * ```
 */
export function createAnythreads(options: CreateAnythreadsOptions): Anythreads {
	let api = options.adapter;

	// Apply decorators in order:
	// 1. Moderation (innermost - runs first on writes)
	// 2. Cache (outermost - checks cache before hitting moderation/db)
	if (options.moderation) {
		api = withModeration(api, options.moderation);
	}
	if (options.cache) {
		api = withCache(api, options.cache);
	}

	return api;
}
