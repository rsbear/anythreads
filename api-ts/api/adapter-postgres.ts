import type { Database } from "bun:sqlite";
import type { DataAdapter } from "./adapter.ts";

import { PostgresAccountsAdapter } from "./accounts/postgres";
import { PostgresRepliesAdapter } from "./replies/postgres";
import { PostgresThreadsAdapter } from "./threads/postgres";
import { PostgresVotesAdapter } from "./votes/postgres";

export function createPostgresAdapter(db: Database): DataAdapter {
  return {
    accounts: new PostgresAccountsAdapter(db),
    threads: new PostgresThreadsAdapter(db),
    replies: new PostgresRepliesAdapter(db),
    votes: new PostgresVotesAdapter(db),
  };
}
