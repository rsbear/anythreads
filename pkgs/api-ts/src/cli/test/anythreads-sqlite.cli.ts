import { Database } from "bun:sqlite";
import { setupAnythreads } from "../mod.ts";

const db = new Database("file:test.sqlite");

export default setupAnythreads({ bunSQLite: db });
