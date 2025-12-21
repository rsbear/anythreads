import type { Command } from "../core/executor.ts";

const TABLES = ["accounts", "threads", "replies", "votes"] as const;
type TableName = typeof TABLES[number];

async function emptyTable(db: any, dbType: "bun_sqlite" | "postgres", table: TableName): Promise<void> {
  console.log(`Emptying ${table} table...`);
  const sql = `DELETE FROM ${table}`;
  
  if (dbType === "bun_sqlite") {
    db.run(sql);
  } else {
    await db.query(sql);
  }
}

export const emptyCommand: Command = {
  name: "empty",
  description: "Delete all rows from a table",
  handler: async (config, args) => {
    const target = args[0];
    
    if (!target) {
      throw new Error("Usage: empty <accounts|threads|replies|votes|all>");
    }
    
    if (target === "all") {
      for (const table of [...TABLES].reverse()) {
        await emptyTable(config.db, config.dbType, table);
      }
      console.log("All tables emptied successfully");
    } else if (TABLES.includes(target as TableName)) {
      await emptyTable(config.db, config.dbType, target as TableName);
      console.log(`${target} table emptied successfully`);
    } else {
      throw new Error(`Unknown table: ${target}. Must be one of: ${TABLES.join(", ")}, all`);
    }
  },
};
