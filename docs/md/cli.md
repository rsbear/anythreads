# @anythreads/cli

A really simple CLI for setting up your database tables, indexes, and seeding data.

### Read the `--help` menu
::: code-group

```sh [npm]
npx @anythreads/cli --help
```

```sh [pnpm]
pnpx @anythreads/api --help
```

```sh [bun]
bunx @anythreads/cli --help
```

```sh [deno]
deno run @anythreads/cli --help
```

:::


### Setup tables and indexes**
::: code-group

```sh [npm]
npx @anythreads/cli setup all
```

```sh [pnpm]
pnpx @anythreads/cli setup all
```

```sh [bun]
bunx @anythreads/cli setup all
```

```sh [deno]
deno run @anythreads/cli setup all
```

:::


### Delete all rows in accounts, threads, comments, and votes
::: code-group

```sh [npm]
npx @anythreads/cli empty all
```

```sh [pnpm]
pnpx @anythreads/cli empty all
```

```sh [bun]
bunx @anythreads/cli empty all
```

```sh [deno]
deno run @anythreads/cli empty all
```

:::


### Drop all tables (accounts, threads, comments, and votes)
::: code-group

```sh [npm]
npx @anythreads/cli drop all
```

```sh [pnpm]
pnpx @anythreads/cli drop all
```

```sh [bun]
bunx @anythreads/cli drop all
```

```sh [deno]
deno run @anythreads/cli drop all
```

:::


### Under the hood
**Setup <option>**
TODO: explain how this works

**Empty <option>**
TODO: explain how this works

**Drop <option>**
TODO: explain how this works

**Seed <option>**
TODO: explain how this works


### Here's the full list of commands, just use your favorite package manager
```bash
bunx @anythreads/cli setup accounts
bunx @anythreads/cli setup threads
bunx @anythreads/cli setup replies
bunx @anythreads/cli setup votes
bunx @anythreads/cli setup all

bunx @anythreads/cli seed

bunx @anythreads/cli empty accounts
bunx @anythreads/cli empty threads
bunx @anythreads/cli empty replies
bunx @anythreads/cli empty votes
bunx @anythreads/cli empty all

bunx @anythreads/cli drop accounts
bunx @anythreads/cli drop threads
bunx @anythreads/cli drop replies
bunx @anythreads/cli drop votes
bunx @anythreads/cli drop all
```
