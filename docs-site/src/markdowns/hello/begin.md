---
layout: '../../layouts/MarkdownStyles.astro'
parent: 'Hello'
title: 'Start'
---



# Getting Started

Anythreads is a suite of APIs for easily integrating threads, comments, and votes into JS/TS apps.

### Features
- * Bring your own database
- * Setup content moderation with AI
- * Cache with memory, redis, or valkey
- * Drop in a web handler to get a full REST API
- * React library
- * Fully typed

### Install 
```bash
bun add @anythreads/api
```

### Are you an examples first type of dude?
- [api-ts](https://github.com/rsbear/anythreads/tree/main/examples/api-ts-example)
- [hono-ts](https://github.com/rsbear/anythreads/tree/main/examples/api-ts-hono)
- [vite-react](https://github.com/rsbear/anythreads/tree/main/examples/vite-react)
- [waku-react](https://github.com/rsbear/anythreads/tree/main/examples/waku-react)

---

## Kicking it off

<br />

### 1. Setup your database
Anythreads has a few database adapters built in, you can read about [Database Adapters here](/md/hello/database-adapters)
```ts
// anythreads.config.ts
import { setupAnythreads } from "@anythreads/api/cli"
export default setupAnythreads({
  adapter: adapter(database)
})
```
### 2. Create ncessary tables and indexes
Shortcut for creating the tables and indexes. You can read more about the [CLI here](/md/hello/cli)
```bash 
bunx @anythreads/api setup all
```

### 3. Setup an instance of Anythreads
```ts
import { createAnythreads } from "@anythreads/api";
import { Database } from "bun-sqlite";
const db = new Database("file:test.db");
const at = createAnythreads({  adapter: bunsqliteAdapter(db) })
```

### 4. Instantiate a Web Standards REST API 
```ts
import { createAnythreads } from "@anythreads/api";
import { webrequest } from "@anythreads/api/webrequest"


```



### Some extra notes

This project is early in development and contributions are not only welcome, but encouraged. It's really important to us that you get involved. We hope to foster a thoughtful community where constructive feedback is valued, opinions are heard, problems are solved, and collaboration happens.

<br />

- [Github](https://github.com/rsbear/anythreads)
- [Discussions](https://github.com/rsbear/anythreads/discussions)
- [Contributing](https://github.com/rsbear/anythreads/blob/main/contributing.md)

Cheers, have fun!
:)

