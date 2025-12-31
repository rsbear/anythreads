import type { PropsWithChildren } from "react";
import { getCacheCurrentAccount } from "../CurrentAccount/CurrentAccount.server";
import { getCacheReply } from "../Reply/Reply.server";
import { useThread } from "../Thread/Thread.server";
import { useThreadPersonalization } from "../ThreadPersonalization/ThreadPersonalization.server";
import * as VotesShared from "./Votes.shared";

/**
 * Server-side Votes.Root
 * Extracts vote state from Reply/Thread context and ThreadPersonalization
 */
export async function Root({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	const { reply } = getCacheReply();
	const { thread } = useThread();
	const personalization = useThreadPersonalization();
	const { accountId } = getCacheCurrentAccount();

	// Determine which entity we're voting on
	const voteKey = reply ? `reply:${reply.id}` : `thread:${thread?.id}`;

	// Get current vote from personalization data
	const currentVote =
		personalization.msg?.kind === "some"
			? personalization.msg.value?.[voteKey]
			: undefined;

	// Use provided vote count or fall back to reply vote count
	const voteCount = reply?.voteCount || { upvotes: 0, downvotes: 0, total: 0 };

	const value = {
		accountId,
		threadId: thread?.id || "",
		replyId: reply?.id || null,
		vote: currentVote,
		voteCount,
	};

	if (!className) {
		return (
			<VotesShared.Provider value={value}>{children}</VotesShared.Provider>
		);
	}

	return (
		<VotesShared.Provider value={value}>
			<div className={className}>{children}</div>
		</VotesShared.Provider>
	);
}

// Re-export shared components for server usage
export {
	DownvoteButton,
	Total,
	UpvoteButton,
	useDownvote,
	useUpvote,
	useVoteState,
} from "./Votes.shared";
