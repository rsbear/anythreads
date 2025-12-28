import { type Client as LibSQLClient } from "@libsql/client";
import type { Database } from "bun:sqlite";

import type { Anythreads } from "./../mod.ts";

import { createAnythreads } from "./../mod.ts";

interface SetupAnythreadsOptions {
	bunSQLite?: Database;
	libsql?: LibSQLClient;
	postgres?: any;
	fetch?: {
		url: string;
		credentials?: "include" | "omit" | "same-origin";
	};
}

export interface AnythreadsCLI {
	instance: Anythreads;
	db: Database | LibSQLClient | any | null;
	dbType: "bun_sqlite" | "libsql" | "postgres" | "fetch";
}

export function setupAnythreads(
	options: SetupAnythreadsOptions,
): AnythreadsCLI {
	const adapterCount = [
		options.bunSQLite,
		options.libsql,
		options.postgres,
		options.fetch,
	].filter(Boolean).length;

	if (adapterCount === 0) {
		throw new Error(
			"An adapter is required (bunSQLite, libsql, postgres, or fetch)",
		);
	}

	if (adapterCount > 1) {
		throw new Error("Only one adapter can be provided");
	}

	if (options.bunSQLite) {
		const instanceResult = createAnythreads({
			adapter: { bunSQLite: options.bunSQLite },
		});
		return {
			instance: instanceResult,
			db: options.bunSQLite,
			dbType: "bun_sqlite" as const,
		};
	}

	if (options.libsql) {
		const instanceResult = createAnythreads({
			adapter: { libsql: options.libsql },
		});
		return {
			instance: instanceResult,
			db: options.libsql,
			dbType: "libsql" as const,
		};
	}

	if (options.postgres) {
		const instanceResult = createAnythreads({
			adapter: { postgres: options.postgres },
		});
		return {
			instance: instanceResult,
			db: options.postgres,
			dbType: "postgres" as const,
		};
	}

	if (options.fetch) {
		const instanceResult = createAnythreads({
			adapter: { fetch: options.fetch },
		});
		return {
			instance: instanceResult,
			db: null,
			dbType: "fetch" as const,
		};
	}

	throw new Error("Unreachable");
}
