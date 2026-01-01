import type { VoteCount } from "@anythreads/api/threads";
import type { Vote } from "@anythreads/api/votes";

/**
 * Vote state passed to render prop children
 */
export type VoteState = {
  isUpvoted: boolean;
  isDownvoted: boolean;
  hasVoted: boolean;
  isPending: boolean;
  total: number;
};

/**
 * Combined vote state
 */
export type InternalVoteState = {
  voteCount: VoteCount;
  direction: "up" | "down" | null;
};

/**
 * Context value for Votes components
 */
export type VotesContextValue = {
  vote: Partial<Vote> | undefined;
  voteCount: VoteCount;
  // Current state
  currentVoteCount: VoteCount;
  currentDirection: "up" | "down" | null;
  isPending: boolean;
  handleUpvote: () => Promise<void>;
  handleDownvote: () => Promise<void>;
};
