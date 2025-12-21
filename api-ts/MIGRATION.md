# Migration Guide: API Restructuring

## Overview

The `@anythreads/api` package has been restructured to support a more extensible architecture with unified options for future features like caching and moderation.

## Breaking Changes

### 1. Main Import Changes

**Before:**
```typescript
import { createAnythreads } from '@anythreads/api'

const api = createAnythreads({ bunSQLite: db })
```

**After:**
```typescript
import { createAnythreads } from '@anythreads/api'

const api = createAnythreads({ 
  adapter: { bunSQLite: db } 
})
```

### 2. Type Imports

Types are now organized by domain for better discoverability:

**Before:**
```typescript
import type { Thread, Account, Reply, Vote } from '@anythreads/api'
```

**After:**
```typescript
import type { Thread } from '@anythreads/api/threads'
import type { Account } from '@anythreads/api/accounts'
import type { Reply } from '@anythreads/api/replies'
import type { Vote } from '@anythreads/api/votes'
```

## New Structure

### Package Exports

```json
{
  ".": "./api/index.ts",              // Main entry with createAnythreads
  "./threads": "./api/types/threads.ts",
  "./accounts": "./api/types/accounts.ts",
  "./replies": "./api/types/replies.ts",
  "./votes": "./api/types/votes.ts",
  "./cli": "./api/cli.ts",
  "./webrequests": "./api/webrequests/index.ts"
}
```

## Usage Examples

### SQLite Adapter

```typescript
import { Database } from 'bun:sqlite'
import { createAnythreads } from '@anythreads/api'
import type { Thread } from '@anythreads/api/threads'

const db = new Database('threads.db')
const api = createAnythreads({
  adapter: { bunSQLite: db }
})

const thread = await api.threads.create({
  title: 'Hello World',
  body: 'My first thread',
  accountId: 'user-123'
})
```

### Postgres Adapter

```typescript
import { createAnythreads } from '@anythreads/api'

const api = createAnythreads({
  adapter: {
    postgres: pgClient
  }
})
```

### Fetch Adapter

```typescript
import { createAnythreads } from '@anythreads/api'

const api = createAnythreads({
  adapter: {
    fetch: {
      url: 'https://api.example.com',
      credentials: 'include'
    }
  }
})
```

## Future Features

The new structure supports additional configuration options:

### Cache Support (Coming Soon)

```typescript
const api = createAnythreads({
  adapter: { bunSQLite: db },
  cache: {
    redis: redisClient
  }
})
```

### AI Moderation (Coming Soon)

```typescript
const api = createAnythreads({
  adapter: { bunSQLite: db },
  moderation: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview'
    }
  }
})
```

## Type Imports Reference

### Threads

```typescript
import type {
  Thread,
  ThreadCreate,
  ThreadUpdate,
  ThreadComplete,
  ThreadWithDetails,
  FindManyOptions,
  ThreadsDataAdapter
} from '@anythreads/api/threads'
```

### Accounts

```typescript
import type {
  Account,
  AccountCreateOrUpdate,
  AccountUpdate,
  AccountsDataAdapter
} from '@anythreads/api/accounts'
```

### Replies

```typescript
import type {
  Reply,
  ReplyCreate,
  ReplyUpdate,
  ReplyWithNested,
  RepliesFindManyOptions,
  RepliesDataAdapter
} from '@anythreads/api/replies'
```

### Votes

```typescript
import type {
  Vote,
  VoteInput,
  VoteCount,
  VotesFindManyOptions,
  VotesDataAdapter
} from '@anythreads/api/votes'
```

### Core Types

```typescript
import type {
  Anythreads,
  CreateAnythreadsOptions,
  AdapterConfig,
  CacheConfig,
  ModerationConfig
} from '@anythreads/api'
```
