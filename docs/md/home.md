# Anythreads

Anythreads is a suite of APIs for easily integrating threads, comments, and votes into JS/TS apps.

## Features
- _Bring your own database_, bun-sqlite, sqlite3, postgres, and more
- CLI to work with tables and seed data
- Namespaced functional APIs for threads, comments, and votes
- React library that's designed for composition, completely unstyled
- Drop into Hono, Nitro, or any Web Request/Response framework for a full REST API
- Supports Node.js, Bun, Deno, and appropriate browser support
- Strongly typed
- Tested (mostly..)
- Fully open source

### If you haven't already, install via
::: code-group

```sh [npm]
npm i @anythreads/api
```

```sh [pnpm]
pnpm add @anythreads/api
```

```sh [bun]
bun add @anythreads/api
```

```sh [deno]
deno add npm:@anythreads/api
```

:::


## Example Usage

**Server side**
```ts
// server/index.ts
import { createAnythreads } from "@anythreads/api";
import { Database } from "bun-sqlite";

const db = new Database("file:test.db");

const at = createAnythreads({ bunSQLite: db })

const createThread = await at.threads.create({ ... })
if (createThread.isErr) return createThread.err

const thread = await at.threads.findOne(createThread.data.id)
if (thread.isErr) return createThread.err
```

**Client side aka in the browser**
```ts
// client/index.ts
import { createAnythreads } from "@anythreads/api";

const at = createAnythreads({ fetch: { url }})

const createThread = await at.threads.create({ ... })
if (createThread.isErr) return createThread.err

const thread = await at.threads.findOne(createThread.data.id)
if (thread.isErr) return createThread.err
```


### Some extra notes

This project is early in development and contributions are not only welcome, but encouraged. It's really important to us that you get involved. We hope to foster a thoughtful community where constructive feedback is valued, opinions are heard, problems are solved, and collaboration happens.

- [Github](https://github.com/rsbear/anythreads)
- [Discussions](https://github.com/rsbear/anythreads/discussions)
- [Contributing](https://github.com/rsbear/anythreads/blob/main/contributing.md)

Cheers, have fun!
:)

