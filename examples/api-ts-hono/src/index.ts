import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { webrequests } from '@anythreads/api/webrequests'
import { createAnythreads } from '@anythreads/api'
import { Database } from 'bun:sqlite'


const db = new Database("test.sqlite")

const anythreads = createAnythreads({
  adapter: { bunSQLite: db, }
})

const app = new Hono()

app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))



app.all("/anythreads/*", (ctx) => webrequests(ctx.req.raw, anythreads))

export default app
