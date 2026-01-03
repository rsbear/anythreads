import type { Database } from "bun:sqlite";
import type { Client as LibSQLClient } from "@libsql/client";
import type { Kysely } from "kysely";

import type { Anythreads } from "./../mod.ts";
import type { Database as KyselyDatabase } from "../adapters/kysely/types.ts";

import {
	bunSqliteAdapter,
	createAnythreads,
	fetchAdapter,
	kyselyAdapter,
	libsqlAdapter,
	postgresAdapter,
} from "./../mod.ts";

interface SetupAnythreadsOptions {
	bunSQLite?: Database;
	libsql?: LibSQLClient;
	postgres?: any;
	kysely?: Kysely<KyselyDatabase>;
	fetch?: {
		url: string;
		credentials?: "include" | "omit" | "same-origin";
	};
}

export interface AnythreadsCLI {
	instance: Anythreads;
	db: Database | LibSQLClient | Kysely<KyselyDatabase> | any | null;
	dbType: "bun_sqlite" | "libsql" | "postgres" | "kysely" | "fetch";
}

export function setupAnythreads(
	options: SetupAnythreadsOptions,
): AnythreadsCLI {
	const adapterCount = [
		options.bunSQLite,
		options.libsql,
		options.postgres,
		options.kysely,
		options.fetch,
	].filter(Boolean).length;

	if (adapterCount === 0) {
		throw new Error(
			"An adapter is required (bunSQLite, libsql, postgres, kysely, or fetch)",
		);
	}

	if (adapterCount > 1) {
		throw new Error("Only one adapter can be provided");
	}

	if (options.bunSQLite) {
		const instanceResult = createAnythreads({
			adapter: bunSqliteAdapter(options.bunSQLite),
		});
		return {
			instance: instanceResult,
			db: options.bunSQLite,
			dbType: "bun_sqlite" as const,
		};
	}

	if (options.libsql) {
		const instanceResult = createAnythreads({
			adapter: libsqlAdapter(options.libsql),
		});
		return {
			instance: instanceResult,
			db: options.libsql,
			dbType: "libsql" as const,
		};
	}

	if (options.postgres) {
		const instanceResult = createAnythreads({
			adapter: postgresAdapter(options.postgres),
		});
		return {
			instance: instanceResult,
			db: options.postgres,
			dbType: "postgres" as const,
		};
	}

	if (options.kysely) {
		const instanceResult = createAnythreads({
			adapter: kyselyAdapter(options.kysely),
		});
		return {
			instance: instanceResult,
			db: options.kysely,
			dbType: "kysely" as const,
		};
	}

	if (options.fetch) {
		const instanceResult = createAnythreads({
			adapter: fetchAdapter(options.fetch),
		});
		return {
			instance: instanceResult,
			db: null,
			dbType: "fetch" as const,
		};
	}

	throw new Error("Unreachable");
}
