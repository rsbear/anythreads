#!/usr/bin/env bun

import { cli, define } from "gunshi";
import { discoverConfig } from "./core/discovery.ts";
import { loadConfig } from "./core/loader.ts";
import { setupCommand } from "./commands/setup.ts";
import { emptyCommand } from "./commands/empty.ts";
import { dropCommand } from "./commands/drop.ts";
import { seedCommand } from "./commands/seed.ts";

const setup = define({
  name: "setup",
  description: "Create tables, indexes, and run migrations",
  args: {
    table: {
      type: "positional",
      description: "Table to setup (accounts|threads|replies|votes|all)",
      required: true,
    },
  },
  run: async (ctx) => {
    try {
      const configPath = await discoverConfig();

      if (!configPath) {
        console.error(
          "Error: Could not find anythreads.cli.ts in current directory or parent directories",
        );
        console.error("Please create an anythreads.cli.ts file with your database configuration");
        process.exit(1);
      }

      console.log(`Using config: ${configPath}`);
      const config = await loadConfig(configPath);
      await setupCommand.handler(config, [ctx.values.table]);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  },
});

const empty = define({
  name: "empty",
  description: "Delete all rows from a table",
  args: {
    table: {
      type: "positional",
      description: "Table to empty (accounts|threads|replies|votes|all)",
      required: true,
    },
  },
  run: async (ctx) => {
    try {
      const configPath = await discoverConfig();

      if (!configPath) {
        console.error(
          "Error: Could not find anythreads.cli.ts in current directory or parent directories",
        );
        console.error("Please create an anythreads.cli.ts file with your database configuration");
        process.exit(1);
      }

      console.log(`Using config: ${configPath}`);
      const config = await loadConfig(configPath);
      await emptyCommand.handler(config, [ctx.values.table]);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  },
});

const drop = define({
  name: "drop",
  description: "Drop a table",
  args: {
    table: {
      type: "positional",
      description: "Table to drop (accounts|threads|replies|votes|all)",
      required: true,
    },
  },
  run: async (ctx) => {
    try {
      const configPath = await discoverConfig();

      if (!configPath) {
        console.error(
          "Error: Could not find anythreads.cli.ts in current directory or parent directories",
        );
        console.error("Please create an anythreads.cli.ts file with your database configuration");
        process.exit(1);
      }

      console.log(`Using config: ${configPath}`);
      const config = await loadConfig(configPath);
      await dropCommand.handler(config, [ctx.values.table]);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  },
});

const seed = define({
  name: "seed",
  description:
    "Seed database with data from seed.json (3 accounts, 2 threads, 8 replies, 10 votes)",
  run: async () => {
    try {
      const configPath = await discoverConfig();

      if (!configPath) {
        console.error(
          "Error: Could not find anythreads.cli.ts in current directory or parent directories",
        );
        console.error("Please create an anythreads.cli.ts file with your database configuration");
        process.exit(1);
      }

      console.log(`Using config: ${configPath}`);
      const config = await loadConfig(configPath);
      await seedCommand.handler(config, []);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  },
});

const main = define({
  name: "anythreads",
  description: "Anythreads CLI - Manage your threaded discussion database",
  run: () => {
    console.log("Use a sub-command");
    console.log('Run "anythreads --help" for available commands');
  },
});

await cli(process.argv.slice(2), main, {
  name: "anythreads",
  version: "0.0.1",
  subCommands: {
    setup,
    empty,
    drop,
    seed,
  },
});
