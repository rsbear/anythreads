import { Database } from "bun:sqlite";

import { setupAnythreads } from '@anythreads/api/cli';

const db = new Database("test.sqlite");

export default setupAnythreads({ bunSQLite: db });
