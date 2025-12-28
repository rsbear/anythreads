import { Database } from "bun:sqlite";
import { setupAnythreads } from "../../api/cli.ts";

const db = new Database("file:test.sqlite");

export default setupAnythreads({ bunSQLite: db });
