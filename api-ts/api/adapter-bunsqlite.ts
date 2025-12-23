import type { Database } from "bun:sqlite";
import type { DataAdapter } from "./adapter.ts";

import { BunSQLiteAccountsAdapter } from "./accounts/bunsqlite";
import { BunSQLiteRepliesAdapter } from "./replies/bunsqlite.ts";
import { BunSQLiteThreadsAdapter } from "./threads/bunsqlite.ts";
import { BunSQLiteVotesAdapter } from "./votes/bunsqlite.ts";

export function createBunSQLiteAdapter(db: Database): DataAdapter {
  return {
    threads: new BunSQLiteThreadsAdapter(db),
    accounts: new BunSQLiteAccountsAdapter(db),
    replies: new BunSQLiteRepliesAdapter(db),
    votes: new BunSQLiteVotesAdapter(db),
  };
}
