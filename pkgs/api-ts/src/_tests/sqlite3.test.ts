import { describe, test } from "bun:test";

describe("SQLite3 Adapter - Full Coverage", () => {
  test("skip - better-sqlite3 not supported in Bun", () => {
    console.log("⚠️  better-sqlite3 is not yet supported in Bun runtime.");
    console.log("   These tests are designed to run in Node.js with better-sqlite3.");
    console.log("   Use bun:sqlite tests instead, or run this test with Node.js.");
    console.log("   Track Bun support: https://github.com/oven-sh/bun/issues/4290");
  });
});
