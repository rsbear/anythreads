import { createAnythreads } from "@anythreads/api";
import { webrequests } from "@anythreads/api/webrequests";
import { createClient } from "@libsql/client";

const client = createClient({ url: "file:test.sqlite" });

export const anythreads = createAnythreads({
  adapter: {
    libsql: client,
  },
});

export default async function handler(req: Request): Promise<Response> {
  return await webrequests(req, anythreads);
}
