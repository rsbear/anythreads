"use client";

import type { PropsWithChildren } from "react";
import { useReply } from "../Reply/Reply.browser";
import { useThread } from "../Thread/Thread.browser";
import { useThreadPersonalization } from "../ThreadPersonalization/ThreadPersonalization.browser";
import * as VotesShared from "./composables";

/**
 * Client-side Votes.Root
 * Extracts vote state from browser contexts
 */
export function Root({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const thread = useThread();
  const reply = useReply();
  const { personalizationData } = useThreadPersonalization();

  // Determine which entity we're voting on
  const voteKey = reply ? `reply:${reply.id}` : `thread:${thread?.id}`;

  // Get current vote from personalization data
  const currentVote =
    personalizationData.kind === "some"
      ? personalizationData.value?.[voteKey]
      : undefined;

  // Use provided vote count or fall back to reply vote count
  const voteCount = reply?.voteCount || { upvotes: 0, downvotes: 0, total: 0 };

  const value = {
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

// Re-export shared components for browser usage
export {
  DownvoteButton,
  Total,
  UpvoteButton,
  useDownvote,
  useUpvote,
  useVoteState,
} from "./composables";
