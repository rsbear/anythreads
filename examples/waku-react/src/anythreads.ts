import { createAnythreads } from "@anythreads/api";
import { createClient } from "@libsql/client";

const client = createClient({ url: "file:test.sqlite" });

export const anythreads = createAnythreads({
  adapter: {
    libsql: client,
  },
});
