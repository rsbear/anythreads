import type { CacheConfig, CacheStore } from "../types.ts";

interface CacheEntry {
	value: unknown;
	expires: number;
}

/**
 * Create an in-memory cache store.
 *
 * @param opts.ttl - Default TTL in milliseconds (default: 60000)
 * @param opts.maxSize - Maximum number of entries (default: 1000)
 */
export function memoryCache(opts?: {
	ttl?: number;
	maxSize?: number;
}): CacheConfig {
	const ttl = opts?.ttl ?? 60_000;
	const maxSize = opts?.maxSize ?? 1000;
	const cache = new Map<string, CacheEntry>();

	const store: CacheStore = {
		async get<T>(key: string): Promise<T | null> {
			const entry = cache.get(key);
			if (!entry) return null;

			if (Date.now() > entry.expires) {
				cache.delete(key);
				return null;
			}

			return entry.value as T;
		},

		async set<T>(key: string, value: T, customTtl?: number): Promise<void> {
			// Evict oldest entries if at max size
			if (cache.size >= maxSize) {
				const firstKey = cache.keys().next().value;
				if (firstKey) cache.delete(firstKey);
			}

			cache.set(key, {
				value,
				expires: Date.now() + (customTtl ?? ttl),
			});
		},

		async delete(key: string): Promise<void> {
			cache.delete(key);
		},

		async deletePattern(pattern: string): Promise<void> {
			// Convert glob pattern to regex (simple * wildcard support)
			const regex = new RegExp(
				`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`,
			);

			for (const key of cache.keys()) {
				if (regex.test(key)) {
					cache.delete(key);
				}
			}
		},
	};

	return {
		store,
		ttl,
	};
}
