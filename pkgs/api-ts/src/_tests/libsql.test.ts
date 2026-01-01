import { afterEach, beforeAll, describe } from "bun:test";
import { createClient } from "@libsql/client";
import { setupAnythreads } from "../cli/mod.ts";
import {
	createAccountsStr,
	createRepliesStr,
	createThreadsStr,
	createVotesStr,
} from "../common/create-tables/sqlite.ts";
import { flowCoverage } from "./flow-coverage.js";

describe("LibSQL Adapter - Full Coverage", () => {
	const client = createClient({ url: "file::memory:" });

	beforeAll(async () => {
		await client.execute(createAccountsStr);
		await client.execute(createThreadsStr);
		await client.execute(createRepliesStr);
		await client.execute(createVotesStr);
	});

	afterEach(async () => {
		await client.batch(
			[
				"DELETE FROM votes",
				"DELETE FROM replies",
				"DELETE FROM threads",
				"DELETE FROM accounts",
			],
			"write",
		);
	});

	const setup = setupAnythreads({ libsql: client });

	flowCoverage(setup);
});
