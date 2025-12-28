import { describe, expect, test } from "bun:test";
import { dirname, join } from "path";
import { discoverConfig } from "../core/discovery.ts";

describe("Config Discovery", () => {
	test("should find config in test directory", async () => {
		const testDir = dirname(import.meta.url).replace("file://", "");
		const configPath = await discoverConfig(testDir);

		expect(configPath).toBeTruthy();
		expect(configPath).toContain("anythreads.cli.ts");
	});

	test("should find config in parent directories", async () => {
		const testDir = dirname(import.meta.url).replace("file://", "");
		const nestedDir = join(testDir, "nested", "deeply");

		const configPath = await discoverConfig(testDir);

		expect(configPath).toBeTruthy();
		expect(configPath).toContain("anythreads.cli.ts");
	});

	test("should return null if config not found", async () => {
		const configPath = await discoverConfig("/tmp");

		expect(configPath).toBeNull();
	});
});
