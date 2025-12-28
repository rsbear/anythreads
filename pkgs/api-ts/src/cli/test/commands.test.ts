import { describe, expect, test } from "bun:test";
import { dirname, join } from "node:path";
import { dropCommand } from "../commands/drop.ts";
import { emptyCommand } from "../commands/empty.ts";
import { seedCommand } from "../commands/seed.ts";
import { setupCommand } from "../commands/setup.ts";
import { CommandExecutor } from "../core/executor.ts";
import { loadConfig } from "../core/loader.ts";

describe("CLI Commands", () => {
  const executor = new CommandExecutor();
  executor.register(setupCommand);
  executor.register(emptyCommand);
  executor.register(dropCommand);
  executor.register(seedCommand);

  test("should register all commands", () => {
    const commands = executor.listCommands();

    expect(commands.length).toBe(4);
    expect(commands.map((c) => c.name)).toContain("setup");
    expect(commands.map((c) => c.name)).toContain("empty");
    expect(commands.map((c) => c.name)).toContain("drop");
    expect(commands.map((c) => c.name)).toContain("seed");
  });

  test("should throw error for unknown command", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("unknown", config, [])).rejects.toThrow("Unknown command");
  });

  test("setup command should require target argument", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("setup", config, [])).rejects.toThrow("Usage: setup");
  });

  test("empty command should require target argument", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("empty", config, [])).rejects.toThrow("Usage: empty");
  });

  test("drop command should require target argument", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("drop", config, [])).rejects.toThrow("Usage: drop");
  });

  test("seed command should require target argument", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("seed", config, [])).rejects.toThrow("Usage: seed");
  });

  test("setup command should accept valid table names", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("setup", config, ["accounts"])).resolves.toBeUndefined();
    expect(executor.execute("setup", config, ["threads"])).resolves.toBeUndefined();
    expect(executor.execute("setup", config, ["replies"])).resolves.toBeUndefined();
    expect(executor.execute("setup", config, ["all"])).resolves.toBeUndefined();
  });

  test("setup command should reject invalid table names", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    const config = await loadConfig(configPath);

    expect(executor.execute("setup", config, ["invalid"])).rejects.toThrow(
      "Unknown table",
    );
  });
});
