
# @anythreads/api/webrequest

Drop your anythreads instance into any JS/TS web standards based framework and get a full rest api. Works with [Hono](https://hono.dev), Nitro, Oak, and more.

_**P.S.** Don't forget to get your tables setup - [CLI]("/docs/cli")_

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

## Usage
```ts
// server/index.ts
import { Hono } from 'hono'
import { createAnythreads } from '@anythreads/api'
import { webrequest } from '@anythreads/api/webrequest'

const anythreads = createAnythreads(opts)

const app = new Hono()
app.all('/anythreads/*', (c) => webrequest(c, anythreads))
```

### Endpoints
```bash
GET /anythreads/accounts
GET /anythreads/accounts/:id
POST /anythreads/accounts
PATCH /anythreads/accounts/:id
DELETE /anythreads/accounts/:id
POST /anythreads/accounts/:id/ban
POST /anythreads/accounts/:id/unban

GET /anythreads/threads
GET /anythreads/threads/:id
GET /anythreads/threads/:id/complete
POST /anythreads/threads
PATCH /anythreads/threads/:id
DELETE /anythreads/threads/:id

GET /anythreads/replies
GET /anythreads/replies/:id
POST /anythreads/replies
PATCH /anythreads/replies/:id
DELETE /anythreads/replies/:id

GET /anythreads/votes
GET /anythreads/votes/:id
POST /anythreads/votes/up
POST /anythreads/votes/down
DELETE /anythreads/votes/:id
```




