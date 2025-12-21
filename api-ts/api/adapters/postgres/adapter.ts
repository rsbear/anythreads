import type { DataAdapter } from "../adapter-types";
import { PostgresAccountsAdapter } from "./accounts";
import { PostgresRepliesAdapter } from "./replies";
import { PostgresThreadsAdapter } from "./threads";
import { PostgresVotesAdapter } from "./votes";

export function createPostgresAdapter(db: any): DataAdapter {
  return {
    threads: new PostgresThreadsAdapter(db),
    accounts: new PostgresAccountsAdapter(db),
    replies: new PostgresRepliesAdapter(db),
    votes: new PostgresVotesAdapter(db),
  };
}
