import {
  createAccountsStr,
  createRepliesStr,
  createThreadsStr,
  createVotesStr,
} from "../../common/create-tables/sqlite.ts";
import type { Command } from "../core/executor.ts";

const TABLES = ["accounts", "threads", "replies", "votes"] as const;
type TableName = (typeof TABLES)[number];

const TABLE_SCHEMAS_SQLITE: Record<TableName, string> = {
  accounts: createAccountsStr,
  threads: createThreadsStr,
  replies: createRepliesStr,
  votes: createVotesStr,
};

const TABLE_SCHEMAS_POSTGRES: Record<TableName, string> = {
  accounts: `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      upstream_id TEXT NOT NULL,
      username TEXT NOT NULL,
      email TEXT,
      banned BOOLEAN NOT NULL DEFAULT false,
      badge TEXT,
      banned_at BIGINT,
      banned_until BIGINT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      deleted_at BIGINT,
      extras JSONB NOT NULL DEFAULT '{}'
    )
  `,
  threads: `
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      upstream_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      allow_replies BOOLEAN NOT NULL DEFAULT true,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      deleted_at BIGINT,
      extras JSONB NOT NULL DEFAULT '{}',
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    )
  `,
  replies: `
    CREATE TABLE IF NOT EXISTS replies (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      body TEXT NOT NULL,
      reply_to_id TEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      deleted_at BIGINT,
      extras JSONB NOT NULL DEFAULT '{}',
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      FOREIGN KEY (reply_to_id) REFERENCES replies(id)
    )
  `,
  votes: `
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      thread_id TEXT,
      account_id TEXT NOT NULL,
      reply_id TEXT,
      direction TEXT NOT NULL CHECK(direction IN ('up', 'down')),
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      FOREIGN KEY (reply_id) REFERENCES replies(id),
      CHECK ((thread_id IS NOT NULL AND reply_id IS NULL) OR (thread_id IS NULL AND reply_id IS NOT NULL))
    )
  `,
};

const TABLE_INDEXES: Record<TableName, string[]> = {
  accounts: [],
  threads: ["CREATE INDEX IF NOT EXISTS idx_threads_account_id ON threads(account_id)"],
  replies: [
    "CREATE INDEX IF NOT EXISTS idx_replies_thread_id ON replies(thread_id)",
    "CREATE INDEX IF NOT EXISTS idx_replies_reply_to_id ON replies(reply_to_id)",
    "CREATE INDEX IF NOT EXISTS idx_replies_account_id ON replies(account_id)",
  ],
  votes: [
    "CREATE INDEX IF NOT EXISTS idx_votes_thread_id ON votes(thread_id)",
    "CREATE INDEX IF NOT EXISTS idx_votes_reply_id ON votes(reply_id)",
    "CREATE INDEX IF NOT EXISTS idx_votes_account_id ON votes(account_id)",
  ],
};

async function setupTable(
  db: any,
  dbType: "bun_sqlite" | "sqlite3" | "postgres",
  table: TableName,
): Promise<void> {
  console.log(`Setting up ${table} table...`);

  const schema =
    dbType === "bun_sqlite" || dbType === "sqlite3"
      ? TABLE_SCHEMAS_SQLITE[table]
      : TABLE_SCHEMAS_POSTGRES[table];

  if (dbType === "bun_sqlite" || dbType === "sqlite3") {
    db.run(schema);
    for (const indexSql of TABLE_INDEXES[table]) {
      db.run(indexSql);
    }
  } else {
    await db.query(schema);
    for (const indexSql of TABLE_INDEXES[table]) {
      await db.query(indexSql);
    }
  }

  if (TABLE_INDEXES[table].length > 0) {
    console.log(`Created ${TABLE_INDEXES[table].length} index(es) for ${table}`);
  }
}

export const setupCommand: Command = {
  name: "setup",
  description: "Create tables, indexes, and run migrations",
  handler: async (config, args) => {
    const target = args[0];

    if (!target) {
      throw new Error("Usage: setup <accounts|threads|replies|votes|all>");
    }

    if (target === "all") {
      for (const table of TABLES) {
        await setupTable(config.db, config.dbType, table);
      }
      console.log("All tables set up successfully");
    } else if (TABLES.includes(target as TableName)) {
      await setupTable(config.db, config.dbType, target as TableName);
      console.log(`${target} table set up successfully`);
    } else {
      throw new Error(
        `Unknown table: ${target}. Must be one of: ${TABLES.join(", ")}, all`,
      );
    }
  },
};
