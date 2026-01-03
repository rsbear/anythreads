---
layout: '../../layouts/MarkdownStyles.astro'
parent: 'Instance'
title: 'createAnythreads'
---

# createAnythreads

Create an Anythreads instance with optional moderation and caching.

<br />

## Config Type

```ts
interface CreateAnythreadsOptions {
  adapter: Anythreads
  moderation?: ModerationConfig
  cache?: CacheConfig
}
```

<br />

## Adapters

Adapters connect Anythreads to your database. Available adapters:

```ts
import { createAnythreads } from "@anythreads/api";

// LibSQL (Turso)
import { createClient } from "@libsql/client";
import { libsqlAdapter } from "@anythreads/api";
const client = createClient({ url: "libsql://..." });
const at = createAnythreads({ adapter: libsqlAdapter(client) });

// Postgres
import { Pool } from "pg";
import { postgresAdapter } from "@anythreads/api";
const pool = new Pool({ connectionString: "postgres://..." });
const at = createAnythreads({ adapter: postgresAdapter(pool) });

// Bun SQLite
import { Database } from "bun:sqlite";
import { bunSqliteAdapter } from "@anythreads/api";
const db = new Database("threads.db");
const at = createAnythreads({ adapter: bunSqliteAdapter(db) });

// Fetch (remote API)
import { fetchAdapter } from "@anythreads/api";
const at = createAnythreads({ 
  adapter: fetchAdapter("https://api.example.com") 
});
```

<br />

## Moderation

AI-powered content moderation using Vercel AI SDK providers.

```ts
import { createAnythreads, libsqlAdapter } from "@anythreads/api";
import { openai } from "@ai-sdk/openai";

const at = createAnythreads({
  adapter: libsqlAdapter(client),
  moderation: {
    provider: openai("gpt-4o-mini"),
    checkThreads: true,  // default: true
    checkReplies: true,  // default: true
    onFlag: (content, reason) => {
      console.log("Flagged:", reason);
    },
  },
});
```

### ModerationConfig

```ts
interface ModerationConfig {
  provider: LanguageModelV1        // AI SDK provider
  prompt?: string                  // Custom moderation prompt
  checkThreads?: boolean           // Moderate threads (default: true)
  checkReplies?: boolean           // Moderate replies (default: true)
  onFlag?: (content, reason) => void  // Callback when flagged
}
```

<br />

## Caching

Cache read operations and automatically invalidate on writes.

```ts
import { createAnythreads, libsqlAdapter, memoryCache } from "@anythreads/api";

const at = createAnythreads({
  adapter: libsqlAdapter(client),
  cache: memoryCache({ 
    ttl: 60_000,      // 60 seconds (default)
    maxSize: 1000,    // max entries (default: 1000)
  }),
});
```

### CacheConfig

```ts
interface CacheConfig {
  store: CacheStore              // Cache implementation
  ttl?: number                   // TTL in milliseconds
  cacheReads?: boolean           // Cache reads (default: true)
  invalidateOnWrite?: boolean    // Clear cache on writes (default: true)
}
```

### Custom Cache Store

```ts
interface CacheStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  deletePattern(pattern: string): Promise<void>
}

const at = createAnythreads({
  adapter: libsqlAdapter(client),
  cache: {
    store: myCustomStore,
    ttl: 120_000,
  },
});
```
