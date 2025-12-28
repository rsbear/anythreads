import { createAnythreads } from "@anythreads/api";
import  Database  from 'better-sqlite3'

const db = new Database("test.sqlite");

export const anythreads = createAnythreads({
  adapter: {
    sqlite3: db,
  },
});
