import { Kysely, PostgresDialect } from "kysely";
import type { Anythreads } from "../mod.ts";
import { KyselyAccountsAdapter } from "./accounts.ts";
import { KyselyRepliesAdapter } from "./replies.ts";
import { KyselyThreadsAdapter } from "./threads.ts";
import type { Database } from "./types.ts";
import { KyselyVotesAdapter } from "./votes.ts";

/**
 * Create an Anythreads adapter using Kysely query builder.
 * This is the base function that accepts any Kysely instance.
 */
export function kyselyAdapter(db: Kysely<Database>): Anythreads {
	return {
		accounts: new KyselyAccountsAdapter(db),
		threads: new KyselyThreadsAdapter(db),
		replies: new KyselyRepliesAdapter(db),
		votes: new KyselyVotesAdapter(db),
	};
}

/**
 * Create an Anythreads adapter using Kysely with PostgreSQL dialect.
 * This wraps the kyselyAdapter with a Kysely instance configured for PostgreSQL.
 */
export function kyselyPostgresAdapter(pool: any): Anythreads {
	const db = new Kysely<Database>({
		dialect: new PostgresDialect({ pool }),
	});
	return kyselyAdapter(db);
}

/**
 * Create an Anythreads adapter using Kysely with LibSQL dialect.
 * This wraps the kyselyAdapter with a Kysely instance configured for LibSQL.
 */
export function kyselyLibsqlAdapter(config: any): Anythreads {
	// Dynamic import to avoid bundling if not used
	const { LibsqlDialect } = require("@libsql/kysely-libsql");
	const db = new Kysely<Database>({
		dialect: new LibsqlDialect(config),
	});
	return kyselyAdapter(db);
}

/**
 * Create an Anythreads adapter using Kysely with Bun SQLite dialect.
 * This wraps the kyselyAdapter with a Kysely instance configured for Bun SQLite.
 */
export function kyselyBunSqliteAdapter(database: any): Anythreads {
	// Dynamic import to avoid bundling if not used
	const { BunSqliteDialect } = require("kysely-bun-sqlite");
	const db = new Kysely<Database>({
		dialect: new BunSqliteDialect({ database }),
	});
	return kyselyAdapter(db);
}
