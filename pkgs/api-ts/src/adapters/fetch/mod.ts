import type { FetchConfig } from "../../common/fetch-utils.ts";
import type { Anythreads } from "../mod.ts";
import { FetchAccountsAdapter } from "./accounts.ts";
import { FetchRepliesAdapter } from "./replies.ts";
import { FetchThreadsAdapter } from "./threads.ts";
import { FetchVotesAdapter } from "./votes.ts";

export function createFetchAdapter(config: FetchConfig): Anythreads {
  return {
    threads: new FetchThreadsAdapter(config),
    accounts: new FetchAccountsAdapter(config),
    replies: new FetchRepliesAdapter(config),
    votes: new FetchVotesAdapter(config),
  };
}
