import type { Database } from "bun:sqlite";
import type { Anythreads } from "../mod";
import { BunSQLiteAccountsAdapter } from "./accounts";
import { BunSQLiteRepliesAdapter } from "./replies";
import { BunSQLiteThreadsAdapter } from "./threads";
import { BunSQLiteVotesAdapter } from "./votes";

export function createBunSQLiteAdapter(db: Database): Anythreads {
  return {
    threads: new BunSQLiteThreadsAdapter(db),
    accounts: new BunSQLiteAccountsAdapter(db),
    replies: new BunSQLiteRepliesAdapter(db),
    votes: new BunSQLiteVotesAdapter(db),
  };
}
