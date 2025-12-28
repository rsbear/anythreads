import type { Anythreads } from "../mod";
import { PostgresAccountsAdapter } from "./accounts";
import { PostgresRepliesAdapter } from "./replies";
import { PostgresThreadsAdapter } from "./threads";
import { PostgresVotesAdapter } from "./votes";

export function createPostgresAdapter(db: any): Anythreads {
  return {
    accounts: new PostgresAccountsAdapter(db),
    threads: new PostgresThreadsAdapter(db),
    replies: new PostgresRepliesAdapter(db),
    votes: new PostgresVotesAdapter(db),
  };
}
