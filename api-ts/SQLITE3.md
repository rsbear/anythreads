# SQLite3 Adapter for Anythreads

The SQLite3 adapter provides support for using [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) with Anythreads in Node.js environments.

## Overview

The SQLite3 adapter is designed for Node.js applications using the `better-sqlite3` package, which provides a synchronous API for SQLite databases. This adapter is similar to the Bun SQLite adapter but uses the standard Node.js SQLite3 implementation.

**Important:** The SQLite3 adapter is intended for Node.js environments. If you're using Bun, use the `bunSQLite` adapter instead, as `better-sqlite3` is not yet supported in Bun runtime.

## Installation

```bash
npm install better-sqlite3
# or
yarn add better-sqlite3
# or
pnpm add better-sqlite3
```

For TypeScript support, you may also want to install types:

```bash
npm install --save-dev @types/better-sqlite3
```

## Basic Usage

```typescript
import Database from "better-sqlite3";
import { createAnythreads } from "@anythreads/api";

// Create database connection
const db = new Database("./database.db");

// Create anythreads instance with SQLite3 adapter
const anythreads = createAnythreads({
  adapter: { sqlite3: db },
});

// Use the API
const account = await anythreads.accounts.create({
  username: "user1",
  email: "user1@example.com",
});
```

## Setup Tables

Before using the SQLite3 adapter, you need to create the required database tables:

```typescript
import Database from "better-sqlite3";
import {
  createAccountsStr,
  createThreadsStr,
  createRepliesStr,
  createVotesStr,
} from "@anythreads/api/create-tables/sqlite";

const db = new Database("./database.db");

// Create tables
db.exec(createAccountsStr);
db.exec(createThreadsStr);
db.exec(createRepliesStr);
db.exec(createVotesStr);

// Create indexes for better performance
db.exec("CREATE INDEX IF NOT EXISTS idx_threads_account_id ON threads(account_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_replies_thread_id ON replies(thread_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_replies_reply_to_id ON replies(reply_to_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_replies_account_id ON replies(account_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_votes_thread_id ON votes(thread_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_votes_reply_id ON votes(reply_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_votes_account_id ON votes(account_id)");
```

## CLI Usage

You can also use the Anythreads CLI with SQLite3. Create an `anythreads.cli.ts` file:

```typescript
import Database from "better-sqlite3";
import { setupAnythreads } from "@anythreads/api/cli";

const db = new Database("./database.db");

export default setupAnythreads({ sqlite3: db });
```

Then use the CLI commands:

```bash
# Setup tables
npx anythreads setup all

# Seed database with test data
npx anythreads seed

# Empty tables
npx anythreads empty all

# Drop tables
npx anythreads drop all
```

## Database Configuration

### In-Memory Database

For testing or temporary data:

```typescript
const db = new Database(":memory:");
```

### File-Based Database

For persistent storage:

```typescript
const db = new Database("./database.db");
```

### Read-Only Mode

```typescript
const db = new Database("./database.db", { readonly: true });
```

### Additional Options

```typescript
const db = new Database("./database.db", {
  verbose: console.log, // Log all SQL statements
  fileMustExist: false, // Create file if it doesn't exist
});
```

## Differences from Bun SQLite Adapter

| Feature | SQLite3 (`better-sqlite3`) | Bun SQLite (`bun:sqlite`) |
|---------|---------------------------|---------------------------|
| Runtime | Node.js | Bun |
| API Style | Synchronous | Synchronous |
| Execute SQL | `db.exec(sql)` | `db.run(sql)` |
| Prepare Statement | `db.prepare(sql)` | `db.prepare(sql)` |
| Performance | Fast (native) | Very fast (native) |
| Installation | Requires npm package | Built into Bun |

## API Compatibility

The SQLite3 adapter implements the same DataAdapter interface as other adapters, so all operations work identically:

- `anythreads.accounts.*` - Account management
- `anythreads.threads.*` - Thread operations
- `anythreads.replies.*` - Reply operations
- `anythreads.votes.*` - Vote operations

See the main Anythreads documentation for complete API reference.

## Performance Considerations

1. **Use Transactions**: For bulk operations, wrap them in transactions:

```typescript
const insert = db.prepare("INSERT INTO accounts (id, username) VALUES (?, ?)");

const insertMany = db.transaction((accounts) => {
  for (const account of accounts) {
    insert.run(account.id, account.username);
  }
});

insertMany(accountsArray);
```

2. **Enable WAL Mode**: For better concurrent access:

```typescript
db.pragma("journal_mode = WAL");
```

3. **Optimize for Performance**:

```typescript
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -64000"); // 64MB cache
```

## Testing

The SQLite3 adapter includes a test suite, but note that tests can only run in Node.js environments:

```bash
# Run with Node.js test runner
npm test

# Note: bun test will skip SQLite3 tests automatically
```

For testing your own application, use an in-memory database:

```typescript
import { describe, test } from "node:test";
import Database from "better-sqlite3";

describe("My Tests", () => {
  test("should work with SQLite3", async () => {
    const db = new Database(":memory:");
    // ... your tests
  });
});
```

## Troubleshooting

### "better-sqlite3 is not yet supported in Bun"

This error occurs when trying to use the SQLite3 adapter in Bun runtime. Use the `bunSQLite` adapter instead:

```typescript
import { Database } from "bun:sqlite";
import { createAnythreads } from "@anythreads/api";

const db = new Database(":memory:");
const anythreads = createAnythreads({
  adapter: { bunSQLite: db }, // Use bunSQLite, not sqlite3
});
```

### "Module not found: better-sqlite3"

Install the package:

```bash
npm install better-sqlite3
```

### Performance Issues

- Enable WAL mode: `db.pragma("journal_mode = WAL")`
- Increase cache size: `db.pragma("cache_size = -64000")`
- Use transactions for bulk operations
- Create appropriate indexes on frequently queried columns

## Migration from Bun SQLite

To migrate from Bun SQLite to Node.js SQLite3:

1. Install `better-sqlite3`
2. Change import: `import { Database } from "bun:sqlite"` → `import Database from "better-sqlite3"`
3. Change adapter: `{ bunSQLite: db }` → `{ sqlite3: db }`
4. Update SQL execution: `db.run()` → `db.exec()` (for multi-statement SQL)

The database file format is compatible between the two, so you can use the same `.db` file.

## Resources

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/wiki)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Anythreads API Documentation](./README.md)
