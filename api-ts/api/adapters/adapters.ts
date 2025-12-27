import type { Database } from "bun:sqlite";
// --- fetch data adapters
import type { FetchConfig } from "../common/fetch-utils";

import { BunSQLiteAccountsAdapter } from "./accounts/bunsqlite";
import { FetchAccountsAdapter } from "./accounts/fetch";
// --- postgres data adapters
import { PostgresAccountsAdapter } from "./accounts/postgres";
import { SQLite3AccountsAdapter } from "./accounts/sqlite3";
import { BunSQLiteRepliesAdapter } from "./replies/bunsqlite.ts";
import { FetchRepliesAdapter } from "./replies/fetch";
import { PostgresRepliesAdapter } from "./replies/postgres";
import { SQLite3RepliesAdapter } from "./replies/sqlite3.ts";
import { BunSQLiteThreadsAdapter } from "./threads/bunsqlite.ts";
import { FetchThreadsAdapter } from "./threads/fetch";
import { PostgresThreadsAdapter } from "./threads/postgres";
import { SQLite3ThreadsAdapter } from "./threads/sqlite3.ts";
import type { DataAdapter } from "./types.ts";
import { BunSQLiteVotesAdapter } from "./votes/bunsqlite.ts";
import { FetchVotesAdapter } from "./votes/fetch";
import { PostgresVotesAdapter } from "./votes/postgres";
import { SQLite3VotesAdapter } from "./votes/sqlite3.ts";

export function createBunSQLiteAdapter(db: Database): DataAdapter {
  return {
    threads: new BunSQLiteThreadsAdapter(db),
    accounts: new BunSQLiteAccountsAdapter(db),
    replies: new BunSQLiteRepliesAdapter(db),
    votes: new BunSQLiteVotesAdapter(db),
  };
}

export function createSQLite3Adapter(db: any): DataAdapter {
  return {
    threads: new SQLite3ThreadsAdapter(db),
    accounts: new SQLite3AccountsAdapter(db),
    replies: new SQLite3RepliesAdapter(db),
    votes: new SQLite3VotesAdapter(db),
  };
}

export function createFetchAdapter(config: FetchConfig): DataAdapter {
  return {
    threads: new FetchThreadsAdapter(config),
    accounts: new FetchAccountsAdapter(config),
    replies: new FetchRepliesAdapter(config),
    votes: new FetchVotesAdapter(config),
  };
}

export function createPostgresAdapter(db: Database): DataAdapter {
  return {
    accounts: new PostgresAccountsAdapter(db),
    threads: new PostgresThreadsAdapter(db),
    replies: new PostgresRepliesAdapter(db),
    votes: new PostgresVotesAdapter(db),
  };
}
