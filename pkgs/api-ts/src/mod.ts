import type { Database } from "bun:sqlite";
import { createSQLite3Adapter } from "./adapters/better-sqlite3/mod.ts";
import { createBunSQLiteAdapter } from "./adapters/bunsqlite/mod.ts";
import { createFetchAdapter } from "./adapters/fetch/mod.ts";
import type { Anythreads } from "./adapters/mod.ts";
import { createPostgresAdapter } from "./adapters/postgres/mod.ts";

export type AdapterConfig =
  | { bunSQLite: Database }
  | { sqlite3: any }
  | { postgres: any }
  | {
    fetch: { url: string; credentials?: "include" | "omit" | "same-origin" };
  };

export type CacheConfig = { redis: any } | { valkey: any };

export type ModerationConfig = {
  openai?: {
    apiKey: string;
    model?: string;
    moderationPrompt?: string;
  };
};

export interface CreateAnythreadsOptions {
  adapter: AdapterConfig;
}

export type { Anythreads } from "./adapters/mod.ts";

export function createAnythreads(options: CreateAnythreadsOptions): Anythreads {
  let baseAdapter: Anythreads;

  if ("bunSQLite" in options.adapter) {
    baseAdapter = createBunSQLiteAdapter(options.adapter.bunSQLite);
  } else if ("sqlite3" in options.adapter) {
    baseAdapter = createSQLite3Adapter(options.adapter.sqlite3);
  } else if ("postgres" in options.adapter) {
    baseAdapter = createPostgresAdapter(options.adapter.postgres);
  } else if ("fetch" in options.adapter) {
    baseAdapter = createFetchAdapter(options.adapter.fetch);
  } else {
    throw new Error(
      "An adapter is required (bunSQLite, sqlite3, postgres, or fetch)",
    );
  }

  return baseAdapter;
}
