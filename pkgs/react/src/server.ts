import * as Account from "./Account/Account.browser";
import { useAccount } from "./Account/Account.browser";
import * as CurrentAccount from "./CurrentAccount/CurrentAccount.server";
import { getCacheCurrentAccount } from "./CurrentAccount/CurrentAccount.server";
import type { VoteActionFn as ReplyVoteActionFn } from "./Reply/Reply.server";
import * as Reply from "./Reply/Reply.server";
import { getCacheReply } from "./Reply/Reply.server";
import * as Thread from "./Thread/Thread.server";
import { useThread } from "./Thread/Thread.server";
import * as ThreadPersonalization from "./ThreadPersonalization/ThreadPersonalization.server";
import { useThreadPersonalization } from "./ThreadPersonalization/ThreadPersonalization.server";
import type { VoteState } from "./Votes/types";
import * as Votes from "./Votes/Votes.server";

// Re-export vote types
export type VoteActionFn = ReplyVoteActionFn;
export type { VoteState };

export {
	Account,
	CurrentAccount,
	Reply,
	Thread,
	ThreadPersonalization,
	Votes,
	useAccount,
	getCacheCurrentAccount as useCurrentAccount,
	getCacheReply as useReply,
	useThread,
	useThreadPersonalization,
};
