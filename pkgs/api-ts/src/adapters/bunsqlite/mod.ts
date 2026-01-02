import type { Database } from "bun:sqlite";
import type { Anythreads } from "../mod";
import { BunSQLiteAccountsAdapter } from "./accounts";
import { BunSQLiteRepliesAdapter } from "./replies";
import { BunSQLiteThreadsAdapter } from "./threads";
import { BunSQLiteVotesAdapter } from "./votes";

/**
 * Create an Anythreads adapter using Bun's built-in SQLite.
 */
export function bunSqliteAdapter(db: Database): Anythreads {
	return {
		threads: new BunSQLiteThreadsAdapter(db),
		accounts: new BunSQLiteAccountsAdapter(db),
		replies: new BunSQLiteRepliesAdapter(db),
		votes: new BunSQLiteVotesAdapter(db),
	};
}

/** @deprecated Use `bunSqliteAdapter` instead */
export const createBunSQLiteAdapter = bunSqliteAdapter;
