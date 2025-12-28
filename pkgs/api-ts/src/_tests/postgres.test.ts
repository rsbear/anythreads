import { describe } from "bun:test";
import { setupAnythreads } from "../cli/mod.ts";
import { flowCoverage } from "./flow-coverage.ts";

describe("Postgres Adapter - Full Coverage", () => {
	const mockPostgres = {
		query: async () => {
			return { rows: [] };
		},
	};

	const setup = setupAnythreads({ postgres: mockPostgres });

	flowCoverage(setup);
});
