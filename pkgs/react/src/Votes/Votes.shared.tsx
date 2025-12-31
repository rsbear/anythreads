"use client";

import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useOptimistic, useTransition } from "react";
import { useAnythreadsBrowser } from "../Anythreads/Anythreads.browser";
import type {
  OptimisticVoteAction,
  VoteState,
  VotesContextValue,
} from "./types";

const VotesContext = createContext<VotesContextValue | null>(null);

/**
 * Calculate optimistic vote count based on user action
 */
function calculateOptimisticVote(
  baseVote: VoteCount,
  action: OptimisticVoteAction,
): VoteCount {
  const { upvotes, downvotes, total } = baseVote;

  if (action.type === "upvote") {
    if (action.currentDirection === null) {
      // Create new upvote
      return { upvotes: upvotes + 1, downvotes, total: total + 1 };
    }
    if (action.currentDirection === "up") {
      // Toggle off upvote
      return { upvotes: upvotes - 1, downvotes, total: total - 1 };
    }
    // Switch from downvote to upvote
    return { upvotes: upvotes + 1, downvotes: downvotes - 1, total: total + 2 };
  }

  // action.type === "downvote"
  if (action.currentDirection === null) {
    // Create new downvote
    return { upvotes, downvotes: downvotes + 1, total: total - 1 };
  }
  if (action.currentDirection === "down") {
    // Toggle off downvote
    return { upvotes, downvotes: downvotes - 1, total: total + 1 };
  }
  // Switch from upvote to downvote
  return { upvotes: upvotes - 1, downvotes: downvotes + 1, total: total - 2 };
}

/**
 * Shared Provider for Votes context
 */
export function Provider({
  children,
  value,
}: PropsWithChildren<{ value: VotesContextValue }>) {
  const baseVote = value.vote || { upvotes: 0, downvotes: 0, total: 0 };
  const [isPending, startTransition] = useTransition();
  const [optimisticVote, setOptimisticVote] = useOptimistic(
    baseVote,
    calculateOptimisticVote,
  );

  const dispatchOptimistic = (action: OptimisticVoteAction) => {
    startTransition(() => {
      setOptimisticVote(action);
    });
  };

  const contextValue: VotesContextValue = {
    ...value,
    optimisticVote,
    isPending,
    dispatchOptimistic,
  };

  return (
    <VotesContext.Provider value={contextValue}>
      {children}
    </VotesContext.Provider>
  );
}

/**
 * Hook to get votes context
 */
function useVotesContext(): VotesContextValue {
  const ctx = useContext(VotesContext);
  if (!ctx) {
    throw new Error("Votes components must be used within Votes.Root");
  }
  return ctx;
}

/**
 * Display total vote count
 */
export function Total({
  children,
  className,
}: {
  children?:
  | React.ReactNode
  | ((state: { total: number; isPending: boolean }) => React.ReactNode);
  className?: string;
}) {
  const ctx = useVotesContext();
  const total = ctx.optimisticVote?.total ?? ctx.voteCount?.total ?? 0;
  const isPending = ctx.isPending ?? false;

  if (typeof children === "function") {
    return <>{children({ total, isPending })}</>;
  }

  if (className) {
    return <span className={className}>{children ?? total}</span>;
  }

  return <>{children ?? total}</>;
}

/**
 * Upvote button with render prop pattern
 */
export function UpvoteButton({
  children,
  className,
}: {
  children?: React.ReactNode | ((state: VoteState) => React.ReactNode);
  className?: string;
}) {
  const [_, startTransition] = useTransition();
  const ctx = useVotesContext();
  const anythreads = useAnythreadsBrowser();

  const handleClick = () => {
    if (!ctx.accountId) {
      console.warn("No accountId available for upvote");
      return;
    }

    const currentDirection = ctx.vote?.direction ?? undefined;
    const voteId = ctx.vote?.id ?? undefined;

    // Dispatch optimistic update immediately
    ctx.dispatchOptimistic?.({
      type: "upvote",
      currentDirection: currentDirection ?? null,
    });

    // Then run vote logic
    startTransition(async () => {
      try {
        if (!voteId) {
          // No existing vote, create upvote
          await anythreads.votes.create({
            accountId: ctx.accountId as string,
            threadId: ctx.threadId,
            replyId: ctx.replyId ?? undefined,
            direction: "up",
          });
        } else if (currentDirection === "up") {
          // Toggle off upvote
          await anythreads.votes.delete(voteId);
        } else if (currentDirection === "down") {
          // Switch from downvote to upvote
          await anythreads.votes.update(voteId, "up");
        }
      } catch (error) {
        console.error("Failed to upvote:", error);
        // TODO: implement error toast
      }
    });
  };

  const state: VoteState = {
    isUpvoted: ctx.vote?.direction === "up",
    isDownvoted: ctx.vote?.direction === "down",
    hasVoted: !!ctx.vote,
    isPending: ctx.isPending ?? false,
    total: ctx.optimisticVote?.total ?? ctx.vote?.total ?? 0,
  };

  if (typeof children === "function") {
    return (
      <button type="button" onClick={handleClick} className={className}>
        {children(state)}
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children || "↑"}
    </button>
  );
}

/**
 * Downvote button with render prop pattern
 */
export function DownvoteButton({
  children,
  className,
}: {
  children?: React.ReactNode | ((state: VoteState) => React.ReactNode);
  className?: string;
}) {
  const [_, startTransition] = useTransition();
  const ctx = useVotesContext();
  const anythreads = useAnythreadsBrowser();

  const handleClick = () => {
    if (!ctx.accountId) {
      console.warn("No accountId available for downvote");
      return;
    }

    const currentDirection = ctx.vote?.direction ?? undefined;
    const voteId = ctx.vote?.id ?? undefined;

    // Dispatch optimistic update immediately
    ctx.dispatchOptimistic?.({
      type: "downvote",
      currentDirection: currentDirection ?? null,
    });

    // Then run vote logic
    startTransition(async () => {
      try {
        if (!voteId) {
          // No existing vote, create downvote
          await anythreads.votes.create({
            accountId: ctx.accountId as string,
            threadId: ctx.threadId,
            replyId: ctx.replyId ?? undefined,
            direction: "down",
          });
        } else if (currentDirection === "down") {
          // Toggle off downvote
          await anythreads.votes.delete(voteId);
        } else if (currentDirection === "up") {
          // Switch from upvote to downvote
          await anythreads.votes.update(voteId, "down");
        }
      } catch (error) {
        console.error("Failed to downvote:", error);
        // TODO: implement error toast
      }
    });
  };

  const state: VoteState = {
    isUpvoted: ctx.vote?.direction === "up",
    isDownvoted: ctx.vote?.direction === "down",
    hasVoted: !!ctx.vote,
    isPending: ctx.isPending ?? false,
    total: ctx.optimisticVote?.total ?? ctx.vote?.total ?? 0,
  };

  if (typeof children === "function") {
    return (
      <button type="button" onClick={handleClick} className={className}>
        {children(state)}
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children || "↓"}
    </button>
  );
}
