import type { AccountsDataAdapter } from "./adapter-accounts.ts";
import type { RepliesDataAdapter } from "./adapter-replies.ts";
import type { ThreadsDataAdapter } from "./adapter-threads.ts";
import type { VotesDataAdapter } from "./adapter-votes.ts";

/**
 * The primary adapter interface for Anythreads.
 * This interface defines the methods that must be implemented by the adapter.
 */
export interface Anythreads {
	accounts: AccountsDataAdapter;
	threads: ThreadsDataAdapter;
	replies: RepliesDataAdapter;
	votes: VotesDataAdapter;
}
