import type { Anythreads } from "../mod";
import { SQLite3AccountsAdapter } from "./accounts";
import { SQLite3RepliesAdapter } from "./replies";
import { SQLite3ThreadsAdapter } from "./threads";
import { SQLite3VotesAdapter } from "./votes";

export function createSQLite3Adapter(db: any): Anythreads {
  return {
    threads: new SQLite3ThreadsAdapter(db),
    accounts: new SQLite3AccountsAdapter(db),
    replies: new SQLite3RepliesAdapter(db),
    votes: new SQLite3VotesAdapter(db),
  };
}
