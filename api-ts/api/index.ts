import type { Database } from "bun:sqlite";
import type { DataAdapter } from "./adapters/adapter-types";
import { createBunSQLiteAdapter } from "./adapters/bun-sqlite/adapter";
import { createFetchAdapter } from "./adapters/fetch/adapter";
import { createPostgresAdapter } from "./adapters/postgres/adapter";

export type AdapterConfig =
  | { bunSQLite: Database }
  | { postgres: any }
  | { fetch: { url: string; credentials?: "include" | "omit" | "same-origin" } };

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
  cache?: CacheConfig;
  moderation?: ModerationConfig;
}

export type { DataAdapter as Anythreads } from "./adapters/adapter-types";

export function createAnythreads(options: CreateAnythreadsOptions): DataAdapter {
  let baseAdapter: DataAdapter;

  if ("bunSQLite" in options.adapter) {
    baseAdapter = createBunSQLiteAdapter(options.adapter.bunSQLite);
  } else if ("postgres" in options.adapter) {
    baseAdapter = createPostgresAdapter(options.adapter.postgres);
  } else if ("fetch" in options.adapter) {
    baseAdapter = createFetchAdapter(options.adapter.fetch);
  } else {
    throw new Error("An adapter is required (bunSQLite, postgres, or fetch)");
  }

  return baseAdapter;
}
