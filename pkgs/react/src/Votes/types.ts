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
 * Optimistic vote action types
 */
export type OptimisticVoteAction =
  | { type: "upvote"; currentDirection: "up" | "down" | null }
  | { type: "downvote"; currentDirection: "up" | "down" | null };

/**
 * Context value for Votes components
 */
export type VotesContextValue = {
  accountId: string | undefined;
  threadId: string;
  replyId: string | null;
  vote: Partial<Vote> | undefined;
  voteCount: VoteCount;
  optimisticVote?: VoteCount;
  isPending?: boolean;
  dispatchOptimistic?: (action: OptimisticVoteAction) => void;
};
