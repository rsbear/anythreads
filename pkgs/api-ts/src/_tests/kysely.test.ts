import { afterEach, beforeAll, describe } from "bun:test";
import { Database as BunDatabase } from "bun:sqlite";
import { Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { setupAnythreads } from "../cli/mod.ts";
import {
  createAccountsStr,
  createRepliesStr,
  createThreadsStr,
  createVotesStr,
} from "../common/create-tables/sqlite.ts";
import type { Database } from "../adapters/kysely/types.ts";
import { flowCoverage } from "./flow-coverage.ts";

describe("Kysely Adapter - Full Coverage", () => {
  const database = new BunDatabase(":memory:");
  
  // Create Kysely instance with Bun SQLite dialect
  const db = new Kysely<Database>({
    dialect: new BunSqliteDialect({ database }),
  });

  beforeAll(async () => {
    database.run(createAccountsStr);
    database.run(createThreadsStr);
    database.run(createRepliesStr);
    database.run(createVotesStr);
  });

  afterEach(async () => {
    database.run("DELETE FROM votes");
    database.run("DELETE FROM replies");
    database.run("DELETE FROM threads");
    database.run("DELETE FROM accounts");
  });

  const setup = setupAnythreads({ kysely: db });

  flowCoverage(setup);
});
