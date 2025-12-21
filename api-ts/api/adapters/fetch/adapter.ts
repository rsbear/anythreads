import type { DataAdapter } from "../adapter-types";
import { FetchAccountsAdapter } from "./accounts";
import { FetchRepliesAdapter } from "./replies";
import { FetchThreadsAdapter } from "./threads";
import type { FetchConfig } from "./utils";
import { FetchVotesAdapter } from "./votes";

export function createFetchAdapter(config: FetchConfig): DataAdapter {
  return {
    threads: new FetchThreadsAdapter(config),
    accounts: new FetchAccountsAdapter(config),
    replies: new FetchRepliesAdapter(config),
    votes: new FetchVotesAdapter(config),
  };
}
