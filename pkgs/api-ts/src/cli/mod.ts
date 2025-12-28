import type { Database } from "bun:sqlite";

import type { Anythreads } from "./../mod.ts";

import { createAnythreads } from "./../mod.ts";

interface SetupAnythreadsOptions {
  bunSQLite?: Database;
  sqlite3?: any;
  postgres?: any;
  fetch?: {
    url: string;
    credentials?: "include" | "omit" | "same-origin";
  };
}

export interface AnythreadsCLI {
  instance: Anythreads;
  db: Database | any | null;
  dbType: "bun_sqlite" | "sqlite3" | "postgres" | "fetch";
}

export function setupAnythreads(options: SetupAnythreadsOptions): AnythreadsCLI {
  const adapterCount = [options.bunSQLite, options.sqlite3, options.postgres, options.fetch].filter(
    Boolean,
  ).length;

  if (adapterCount === 0) {
    throw new Error("An adapter is required (bunSQLite, sqlite3, postgres, or fetch)");
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

  if (options.sqlite3) {
    const instanceResult = createAnythreads({
      adapter: { sqlite3: options.sqlite3 },
    });
    return {
      instance: instanceResult,
      db: options.sqlite3,
      dbType: "sqlite3" as const,
    };
  }

  if (options.postgres) {
    const instanceResult = createAnythreads({ adapter: { postgres: options.postgres } });
    return {
      instance: instanceResult,
      db: options.postgres,
      dbType: "postgres" as const,
    };
  }

  if (options.fetch) {
    const instanceResult = createAnythreads({ adapter: { fetch: options.fetch } });
    return {
      instance: instanceResult,
      db: null,
      dbType: "fetch" as const,
    };
  }

  throw new Error("Unreachable");
}
