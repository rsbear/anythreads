import { Database } from "bun:sqlite";

import { setupAnythreads } from "../../pkgs/api-ts/src/cli/mod.ts";

const db = new Database("test.sqlite");

export default setupAnythreads({ bunSQLite: db });
