import { createAnythreads } from "@anythreads/api";

export const anythreads = createAnythreads({
  adapter: {
    fetch: {
      url: "http://localhost:3000/anythreads",
      credentials: "include",
    },
  },
});
