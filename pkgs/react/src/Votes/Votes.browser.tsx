"use client";

import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import {
	useCurrentAccount,
	useReply,
	useThread,
	useThreadPersonalization,
} from "../browser";
import * as VotesShared from "./Votes.shared";

/**
 * Client-side Votes.Root
 * Extracts vote state from browser contexts
 */
export function Root({
	children,
	className,
	vote,
}: PropsWithChildren<{ className?: string; vote?: VoteCount }>) {
	const { accountId } = useCurrentAccount();
	const thread = useThread();
	const reply = useReply();
	const personalization = useThreadPersonalization();

	// Determine which entity we're voting on
	const voteKey = reply ? `reply:${reply.id}` : `thread:${thread?.id}`;

	// Get current vote from personalization data
	const currentVote =
		personalization.msg?.kind === "some"
			? personalization.msg.value?.[voteKey]
			: undefined;

	// Use provided vote count or fall back to reply vote count
	const voteCount = vote ||
		reply?.voteCount || { upvotes: 0, downvotes: 0, total: 0 };

	const value = {
		accountId,
		threadId: thread?.id || "",
		replyId: reply?.id || null,
		vote: currentVote ? { ...voteCount, ...currentVote } : voteCount,
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

// Re-export shared components for browser usage
export { DownvoteButton, Total, UpvoteButton } from "./Votes.shared";
