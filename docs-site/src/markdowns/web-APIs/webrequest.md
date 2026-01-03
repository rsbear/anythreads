---
parent: 'Web APIs'
title: 'Webrequest'
---

# @anythreads/api/webrequest

Drop your anythreads instance into any JS/TS web standards based framework and get a full rest api. Works with [Hono](https://hono.dev), Nitro, Oak, and more.

<br />

_**P.S.** Don't forget to get your tables setup - [CLI]("/docs/cli")_

### If you haven't already, install via

```sh [bun]
bun add @anythreads/api
```


## Usage
**Web Standards API** - Stand up a server with a REST API. It's build off of Web Standard request/response. Read more here: [Web APIs](/md/web-APIs/webrequest)
```ts 
import { at } from './anythreads.ts'
import { webrequest } from "@anythreads/api/webrequest"

// with Hono
import { Hono } from 'hono'
const app = new Hono()
app.all("/anythreads", (c) => webrequest(c.req, at))

// Waku API route (/src/pages/api/[...anythreads].ts)
export default async function handler(req: Request): Promise<Response> {
  return await webrequests(req, at);
}
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




