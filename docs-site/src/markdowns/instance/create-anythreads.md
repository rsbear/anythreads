---
layout: '../../layouts/MarkdownStyles.astro'
parent: 'Instance'
title: 'createAnythreads'
---

# @anythreads/api
Create an instance of Anythreads 

<br />

### Config input type
```ts
type AnythreadsConfig = {
  adapter: Adapter
  cache?: Cache
  moderation?: Moderation
}
```

```ts
import { createAnythreads } from "@anythreads/api";

// bun-sqlite
import { Database } from "bun:sqlite";
import { bunsqliteAdapter } from "@anythreads/api/adapters";
const db = new Database("file:test.db");
const at = createAnythreads({ adapter: bunsqliteAdapter(db) })

// OR postgres
import { Database } from "pg";
import { postgresAdapter } from "@anythreads/api/adapters";
const db = new Database("postgres://url");
const at = createAnythreads({  adapter: postgresAdapter(db) })

// OR libsql
import { createClient } from "libsql";
import { libsqlAdapter } from "@anythreads/api/adapters";
const db = createClient("sqlite://test.db");
const at = createAnythreads({  adapter: libsqlAdapter(db) })
```

<br />

## Moderate with AI
