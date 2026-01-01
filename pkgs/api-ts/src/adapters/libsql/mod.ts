import type { Client } from "@libsql/client";
import type { Anythreads } from "../mod";
import { LibSQLAccountsAdapter } from "./accounts";
import { LibSQLRepliesAdapter } from "./replies";
import { LibSQLThreadsAdapter } from "./threads";
import { LibSQLVotesAdapter } from "./votes";

export function createLibSQLAdapter(client: Client): Anythreads {
	return {
		threads: new LibSQLThreadsAdapter(client),
		accounts: new LibSQLAccountsAdapter(client),
		replies: new LibSQLRepliesAdapter(client),
		votes: new LibSQLVotesAdapter(client),
	};
}
