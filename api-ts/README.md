# api-ts

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## CLI
```sh
# create tables, indexed, and migrate
bunx @anythreads/api/cli setup accounts
bunx @anythreads/api/cli setup threads
bunx @anythreads/api/cli setup replies
bunx @anythreads/api/cli setup all # setup all tables

# empty a table (delete all rows)
bunx @anythreads/api/cli empty accounts
bunx @anythreads/api/cli empty threads
bunx @anythreads/api/cli empty replies
bunx @anythreads/api/cli empty all # empty all tables

# drop a table
bunx @anythreads/api/cli drop accounts
bunx @anythreads/api/cli drop threads
bunx @anythreads/api/cli drop replies
bunx @anythreads/api/cli drop all # drop all tables
```
