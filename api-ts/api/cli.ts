import type { Database } from "bun:sqlite";
import type { Anythreads } from "./index";
import { createAnythreads } from "./index";

interface SetupAnythreadsOptions {
  bunSQLite?: Database;
  postgres?: any;
  fetch?: {
    url: string;
    credentials?: "include" | "omit" | "same-origin";
  };
}

export interface AnythreadsCLI {
  instance: Anythreads;
  db: Database | any | null;
  dbType: "bun_sqlite" | "postgres" | "fetch";
}

export function setupAnythreads(options: SetupAnythreadsOptions): AnythreadsCLI {
  const adapterCount = [options.bunSQLite, options.postgres, options.fetch].filter(Boolean).length;

  if (adapterCount === 0) {
    throw new Error("An adapter is required (bunSQLite, postgres, or fetch)");
  }

  if (adapterCount > 1) {
    throw new Error("Only one adapter can be provided");
  }

  if (options.bunSQLite) {
    const instanceResult = createAnythreads({ adapter: { bunSQLite: options.bunSQLite } });
    return {
      instance: instanceResult,
      db: options.bunSQLite,
      dbType: "bun_sqlite" as const,
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
