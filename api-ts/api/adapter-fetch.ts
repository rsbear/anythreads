import type { DataAdapter } from "./adapter";
import type { FetchConfig } from "./common/fetch-utils";
import { FetchThreadsAdapter } from "./threads/fetch";
import { FetchAccountsAdapter } from "./accounts/fetch";
import { FetchRepliesAdapter } from "./replies/fetch";
import { FetchVotesAdapter } from "./votes/fetch";

export function createFetchAdapter(config: FetchConfig): DataAdapter {
  return {
    threads: new FetchThreadsAdapter(config),
    accounts: new FetchAccountsAdapter(config),
    replies: new FetchRepliesAdapter(config),
    votes: new FetchVotesAdapter(config),
  };
}
