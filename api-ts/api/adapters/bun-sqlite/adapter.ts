import type { Database } from "bun:sqlite";
import type { DataAdapter } from "../adapter-types";

import { BunSQLiteAccountsAdapter } from "./accounts";
import { BunSQLiteRepliesAdapter } from "./replies";
import { BunSQLiteThreadsAdapter } from "./threads";
import { BunSQLiteVotesAdapter } from "./votes";

export function createBunSQLiteAdapter(db: Database): DataAdapter {
  return {
    threads: new BunSQLiteThreadsAdapter(db),
    accounts: new BunSQLiteAccountsAdapter(db),
    replies: new BunSQLiteRepliesAdapter(db),
    votes: new BunSQLiteVotesAdapter(db),
  };
}
