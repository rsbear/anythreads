import type { AccountsDataAdapter } from "./accounts/types";
import type { RepliesDataAdapter } from "./replies/types";
import type { ThreadsDataAdapter } from "./threads/types";
import type { VotesDataAdapter } from "./votes/types";

/**
 * The primary adapter interface for Anythreads.
 * This interface defines the methods that must be implemented by the adapter.
 */
export interface DataAdapter {
  accounts: AccountsDataAdapter;
  threads: ThreadsDataAdapter;
  replies: RepliesDataAdapter;
  votes: VotesDataAdapter;
}
