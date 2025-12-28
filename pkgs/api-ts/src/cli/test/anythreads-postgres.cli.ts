import { setupAnythreads } from "../mod.ts";

const pgConfig = {
	host: process.env.POSTGRES_HOST || "localhost",
	port: parseInt(process.env.POSTGRES_PORT || "5432"),
	database: process.env.POSTGRES_DB || "anythreads_test",
	user: process.env.POSTGRES_USER || "postgres",
	password: process.env.POSTGRES_PASSWORD || "postgres",
};

const db = {
	query: async (sql: string) => {
		console.log(`[Postgres Mock] Executing: ${sql.substring(0, 100)}...`);
		return { rows: [] };
	},
};

export default setupAnythreads({ postgres: db });
