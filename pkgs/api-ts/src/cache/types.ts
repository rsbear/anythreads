/**
 * Interface for cache storage backends.
 */
export interface CacheStore {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	deletePattern(pattern: string): Promise<void>;
}

/**
 * Configuration for cache decorator.
 */
export interface CacheConfig {
	/** The cache store implementation */
	store: CacheStore;
	/** Default TTL in milliseconds */
	ttl?: number;
	/** Whether to cache read operations (default: true) */
	cacheReads?: boolean;
	/** Whether to invalidate cache on write operations (default: true) */
	invalidateOnWrite?: boolean;
}
