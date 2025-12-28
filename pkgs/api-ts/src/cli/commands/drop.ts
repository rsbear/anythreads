import type { Command } from "../core/executor.ts";

const TABLES = ["accounts", "threads", "replies", "votes"] as const;
type TableName = (typeof TABLES)[number];

async function dropTable(
	db: any,
	dbType: "bun_sqlite" | "sqlite3" | "postgres",
	table: TableName,
): Promise<void> {
	console.log(`Dropping ${table} table...`);
	const sql = `DROP TABLE IF EXISTS ${table}`;

	if (dbType === "bun_sqlite" || dbType === "sqlite3") {
		db.run(sql);
	} else {
		await db.query(sql);
	}
}

export const dropCommand: Command = {
	name: "drop",
	description: "Drop a table",
	handler: async (config, args) => {
		const target = args[0];

		if (!target) {
			throw new Error("Usage: drop <accounts|threads|replies|votes|all>");
		}

		if (target === "all") {
			for (const table of [...TABLES].reverse()) {
				await dropTable(config.db, config.dbType, table);
			}
			console.log("All tables dropped successfully");
		} else if (TABLES.includes(target as TableName)) {
			await dropTable(config.db, config.dbType, target as TableName);
			console.log(`${target} table dropped successfully`);
		} else {
			throw new Error(
				`Unknown table: ${target}. Must be one of: ${TABLES.join(", ")}, all`,
			);
		}
	},
};
