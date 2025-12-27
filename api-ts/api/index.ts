import type { Database } from "bun:sqlite";
import {
  createBunSQLiteAdapter,
  createFetchAdapter,
  createPostgresAdapter,
  createSQLite3Adapter,
} from "./adapters/adapters.ts";
import type { DataAdapter } from "./adapters/types.ts";

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

export type { DataAdapter as Anythreads } from "./adapters/types.ts";

export function createAnythreads(options: CreateAnythreadsOptions): DataAdapter {
  let baseAdapter: DataAdapter;

  if ("bunSQLite" in options.adapter) {
    baseAdapter = createBunSQLiteAdapter(options.adapter.bunSQLite);
  } else if ("sqlite3" in options.adapter) {
    baseAdapter = createSQLite3Adapter(options.adapter.sqlite3);
  } else if ("postgres" in options.adapter) {
    baseAdapter = createPostgresAdapter(options.adapter.postgres);
  } else if ("fetch" in options.adapter) {
    baseAdapter = createFetchAdapter(options.adapter.fetch);
  } else {
    throw new Error("An adapter is required (bunSQLite, sqlite3, postgres, or fetch)");
  }

  return baseAdapter;
}
