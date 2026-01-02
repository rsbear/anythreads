import type { LanguageModelV1 } from "ai";

/**
 * Context for moderation overrides on write operations.
 */
export interface ModerationContext {
	/** Skip moderation for this operation */
	skip?: boolean;
	/** Override the AI provider for this operation */
	provider?: LanguageModelV1;
	/** Override the moderation prompt for this operation */
	prompt?: string;
}

/**
 * Context for cache overrides.
 */
export interface CacheContext {
	/** Bypass cache entirely for this operation */
	skip?: boolean;
	/** Override TTL for this operation (ms) */
	ttl?: number;
	/** Force cache invalidation */
	invalidate?: boolean;
}

/**
 * Context for read operations (findOne, findMany, complete).
 * Only cache context is relevant for reads.
 */
export interface ReadContext {
	cache?: CacheContext;
}

/**
 * Context for write operations (create, update, delete).
 * Both moderation and cache context are relevant for writes.
 */
export interface WriteContext {
	moderation?: ModerationContext;
	cache?: CacheContext;
}
