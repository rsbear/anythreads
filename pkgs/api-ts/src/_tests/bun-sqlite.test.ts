import { Database } from "bun:sqlite";
import { afterEach, describe } from "bun:test";
import {
	createAccountsStr,
	createRepliesStr,
	createThreadsStr,
	createVotesStr,
} from "../common/create-tables/sqlite.ts";
import { setupAnythreads } from "../cli/mod.ts";
import { flowCoverage } from "./flow-coverage.js";

describe("BunSQLite Adapter - Full Coverage", () => {
	const db = new Database(":memory:");

	db.run(createAccountsStr);
	db.run(createThreadsStr);
	db.run(createRepliesStr);
	db.run(createVotesStr);

	afterEach(() => {
		db.run("DELETE FROM votes");
		db.run("DELETE FROM replies");
		db.run("DELETE FROM threads");
		db.run("DELETE FROM accounts");
	});

	const setup = setupAnythreads({ bunSQLite: db });

	flowCoverage(setup);
});
