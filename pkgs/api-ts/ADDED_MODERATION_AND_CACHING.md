Summary

I've implemented the moderation and caching plugin architecture for Anythreads:

Changes Made

1. Extended Msg<T> with metadata (src/common/msg.ts)
•  Added MsgMetadata interface with cacheHit, cacheTtl, moderation, duration fields
•  Updated some(), none(), err() constructors to accept metadata

2. Added context types (src/common/context.ts)
•  ReadContext - cache context only (for findOne, findMany, complete)
•  WriteContext - moderation + cache context (for create, update, delete)

3. Updated adapter interfaces 
•  All adapters now accept optional ctx?: ReadContext or ctx?: WriteContext as last parameter

4. Renamed adapter factories
•  createLibSQLAdapter → libsqlAdapter (deprecated alias kept)
•  createPostgresAdapter → postgresAdapter
•  createBunSQLiteAdapter → bunSqliteAdapter
•  createFetchAdapter → fetchAdapter

5. AI Moderation (src/moderation/)
•  types.ts - ModerationConfig, ModerationResult
•  service.ts - moderateContent() using Vercel AI SDK's generateObject
•  wrapper.ts - withModeration() decorator for threads/replies

6. Caching (src/cache/)
•  types.ts - CacheStore, CacheConfig
•  stores/memory.ts - memoryCache() factory
•  wrapper.ts - withCache() decorator for all adapters

7. Updated createAnythreads (src/mod.ts)
•  Now accepts adapter, moderation, cache options
•  Applies decorators in correct order

Usage
```ts
import { createAnythreads, libsqlAdapter, memoryCache } from "@anythreads/api";
import { openai } from "@ai-sdk/openai";

const api = createAnythreads({
  adapter: libsqlAdapter(client),
  moderation: {
    provider: openai("gpt-4o-mini"),
    onFlag: (content, reason) => console.log("Blocked:", reason),
  },
  cache: memoryCache({ ttl: 60_000 }),
});

// Per-operation overrides
await api.threads.create(data, { moderation: { skip: true } });
await api.threads.findOne(id, { cache: { skip: true } });

// Check metadata
const result = await api.threads.findOne(id);
console.log(result.metadata?.cacheHit); // true/false
```
