# Decorator System for Anythreads API
## Problem
Need a composable way to add cross-cutting concerns (caching, retry, rate limiting, moderation) to the Anythreads API without requiring users to import and apply separate decorator functions.
## Current State
* `createAnythreads(config)` accepts an `adapter` in the config
* No decorator infrastructure exists
* Cross-cutting concerns would require manual wrapping
## Proposed Changes
### 1. Create Decorator Types and Infrastructure
**New file: `src/decorators/types.ts`**
* Define `Decorator<T>` type as a function that wraps API methods
* Define `DecoratorContext` with method name, args, and metadata
* Define decorator config types for each built-in decorator
### 2. Implement Core Decorators (Internal)
**New file: `src/decorators/caching.ts`**
* `createCachingDecorator(options)`: Internal factory for response caching
* Options: `ttl`, `keyGenerator`, `storage` (memory/custom)
* Wraps read methods (getThread, getComments, etc.)
**New file: `src/decorators/retry.ts`**
* `createRetryDecorator(options)`: Internal factory for automatic retries
* Options: `maxAttempts`, `backoff`, `retryableErrors`
* Wraps all adapter calls with retry logic
**New file: `src/decorators/rateLimit.ts`**
* `createRateLimitDecorator(options)`: Internal factory for rate limiting
* Options: `maxRequests`, `windowMs`, `keyGenerator`
* Prevents excessive API calls
**New file: `src/decorators/moderation.ts`**
* `createModerationDecorator(options)`: Internal factory for content moderation
* Options: `moderator` callback, `onBlock` handler
* Intercepts write operations (createThread, createComment, vote)
### 3. Extend Config Object
**Update: `src/types.ts`**
* Add optional feature fields directly to `AnythreadsConfig`
* Each feature has its own typed options object
```typescript
interface AnythreadsConfig {
  adapter: AnythreadsAdapter;
  caching?: CachingConfig;
  rateLimiting?: RateLimitingConfig;
  aiModeration?: AIModerationConfig;
  logging?: LoggingConfig;
  retry?: RetryConfig;
}
interface CachingConfig {
  ttl?: number;
  keyGenerator?: KeyGenerator;
  storage?: CacheStorage;
}
interface RateLimitingConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: KeyGenerator;
}
interface AIModerationConfig {
  moderator: ModerationFn;
  onBlock?: BlockHandler;
}
interface LoggingConfig {
  logger?: Logger;
  level?: "debug" | "info" | "warn" | "error";
}
interface RetryConfig {
  maxAttempts?: number;
  backoff?: BackoffStrategy;
  retryableErrors?: string[];
}
```
### 4. Update createAnythreads
**Update: `src/createAnythreads.ts`**
* Check for presence of each feature config
* Instantiate and apply decorators for enabled features
* Apply in consistent order: logging → caching → rateLimiting → retry → aiModeration
### 5. Export Public API
**Update: `src/decorators/index.ts`**
* Export types for custom decorator creation (advanced use)
* Keep internal factories private
**Update: `src/index.ts`**
* Export config types for TypeScript users
### 6. Usage Pattern
```typescript
import { createAnythreads } from "@anythreads/api";
const api = createAnythreads({
  adapter,
  caching: { ttl: 60000 },
  retry: { maxAttempts: 3 },
  aiModeration: { moderator: async (content) => ({ allowed: true }) },
  logging: { level: "info" },
});
```
Minimal setup (no features):
```typescript
const api = createAnythreads({ adapter });
```
