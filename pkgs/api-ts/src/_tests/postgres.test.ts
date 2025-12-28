import { describe } from "bun:test";
import { setupAnythreads } from "../cli.ts";
import { fullCoverageTest } from "./full-coverage.ts";

describe("Postgres Adapter - Full Coverage", () => {
	const mockPostgres = {
		query: async () => {
			return { rows: [] };
		},
	};

	const setup = setupAnythreads({ postgres: mockPostgres });

	fullCoverageTest(setup);
});
