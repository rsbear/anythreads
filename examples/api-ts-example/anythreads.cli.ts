import { Database } from "bun:sqlite";

import { setupAnythreads } from './../api-ts/api/cli.ts';

const db = new Database("test.sqlite");

export default setupAnythreads({ bunSQLite: db });


