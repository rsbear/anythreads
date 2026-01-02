import type { Anythreads } from "../mod";
import { PostgresAccountsAdapter } from "./accounts";
import { PostgresRepliesAdapter } from "./replies";
import { PostgresThreadsAdapter } from "./threads";
import { PostgresVotesAdapter } from "./votes";

/**
 * Create an Anythreads adapter using PostgreSQL.
 */
export function postgresAdapter(db: any): Anythreads {
	return {
		accounts: new PostgresAccountsAdapter(db),
		threads: new PostgresThreadsAdapter(db),
		replies: new PostgresRepliesAdapter(db),
		votes: new PostgresVotesAdapter(db),
	};
}

/** @deprecated Use `postgresAdapter` instead */
export const createPostgresAdapter = postgresAdapter;
