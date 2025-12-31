"use client";

import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAnythreadsBrowser } from "../Anythreads/Anythreads.browser";
import type {
	InternalVoteState,
	VoteState,
	VotesContextValue,
} from "./types";

const VotesContext = createContext<VotesContextValue | null>(null);

/**
 * Calculate next vote state based on user action
 */
function calculateNextState(
	currentState: InternalVoteState,
	action: "upvote" | "downvote",
): InternalVoteState {
	const { upvotes, downvotes, total } = currentState.voteCount;
	const currentDirection = currentState.direction;

	if (action === "upvote") {
		if (currentDirection === null) {
			return {
				voteCount: { upvotes: upvotes + 1, downvotes, total: total + 1 },
				direction: "up",
			};
		}
		if (currentDirection === "up") {
			return {
				voteCount: { upvotes: upvotes - 1, downvotes, total: total - 1 },
				direction: null,
			};
		}
		return {
			voteCount: {
				upvotes: upvotes + 1,
				downvotes: downvotes - 1,
				total: total + 2,
			},
			direction: "up",
		};
	}

	// action === "downvote"
	if (currentDirection === null) {
		return {
			voteCount: { upvotes, downvotes: downvotes + 1, total: total - 1 },
			direction: "down",
		};
	}
	if (currentDirection === "down") {
		return {
			voteCount: { upvotes, downvotes: downvotes - 1, total: total + 1 },
			direction: null,
		};
	}
	return {
		voteCount: {
			upvotes: upvotes - 1,
			downvotes: downvotes + 1,
			total: total - 2,
		},
		direction: "down",
	};
}

/**
 * Shared Provider for Votes context
 */
export function Provider({
	children,
	value,
}: PropsWithChildren<{ value: Omit<VotesContextValue, 'currentVoteCount' | 'currentDirection' | 'isPending' | 'handleUpvote' | 'handleDownvote'> }>) {
	const [state, setState] = useState<InternalVoteState>({
		voteCount: value.voteCount || { upvotes: 0, downvotes: 0, total: 0 },
		direction: value.vote?.direction ?? null,
	});
	const [isPending, setIsPending] = useState(false);
	const anythreads = useAnythreadsBrowser();

	// Sync with props when they change from server
	useEffect(() => {
		setState({
			voteCount: value.voteCount || { upvotes: 0, downvotes: 0, total: 0 },
			direction: value.vote?.direction ?? null,
		});
	}, [value.voteCount, value.vote?.direction]);

	const handleVote = useCallback(async (type: "upvote" | "downvote") => {
		if (!value.accountId) {
			console.warn(`No accountId available for ${type}`);
			return;
		}

		const prevState = state;
		const nextState = calculateNextState(prevState, type);
		
		// Capture these for the API calls
		const currentDirection = prevState.direction;
		const voteId = value.vote?.id;

		setState(nextState);
		setIsPending(true);

		try {
			if (type === "upvote") {
				if (!voteId) {
					await anythreads.votes.create({
						accountId: value.accountId,
						threadId: value.threadId,
						replyId: value.replyId ?? undefined,
						direction: "up",
					});
				} else if (currentDirection === "up") {
					await anythreads.votes.delete(voteId);
				} else {
					await anythreads.votes.update(voteId, "up");
				}
			} else {
				// downvote
				if (!voteId) {
					await anythreads.votes.create({
						accountId: value.accountId,
						threadId: value.threadId,
						replyId: value.replyId ?? undefined,
						direction: "down",
					});
				} else if (currentDirection === "down") {
					await anythreads.votes.delete(voteId);
				} else {
					await anythreads.votes.update(voteId, "down");
				}
			}
		} catch (error) {
			console.error(`Failed to ${type}:`, error);
			setState(prevState); // Revert on error
		} finally {
			setIsPending(false);
		}
	}, [value, state, anythreads]);

	const handleUpvote = useCallback(() => handleVote("upvote"), [handleVote]);
	const handleDownvote = useCallback(() => handleVote("downvote"), [handleVote]);

	const contextValue: VotesContextValue = {
		...value,
		currentVoteCount: state.voteCount,
		currentDirection: state.direction,
		isPending,
		handleUpvote,
		handleDownvote,
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
	const total = ctx.currentVoteCount.total;
	const isPending = ctx.isPending;

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
	const ctx = useVotesContext();

	const state: VoteState = {
		isUpvoted: ctx.currentDirection === "up",
		isDownvoted: ctx.currentDirection === "down",
		hasVoted: ctx.currentDirection !== null,
		isPending: ctx.isPending,
		total: ctx.currentVoteCount.total,
	};

	if (typeof children === "function") {
		return (
			<button type="button" onClick={ctx.handleUpvote} className={className}>
				{children(state)}
			</button>
		);
	}

	return (
		<button type="button" onClick={ctx.handleUpvote} className={className}>
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
	const ctx = useVotesContext();

	const state: VoteState = {
		isUpvoted: ctx.currentDirection === "up",
		isDownvoted: ctx.currentDirection === "down",
		hasVoted: ctx.currentDirection !== null,
		isPending: ctx.isPending,
		total: ctx.currentVoteCount.total,
	};

	if (typeof children === "function") {
		return (
			<button type="button" onClick={ctx.handleDownvote} className={className}>
				{children(state)}
			</button>
		);
	}

	return (
		<button type="button" onClick={ctx.handleDownvote} className={className}>
			{children || "↓"}
		</button>
	);
}

/**
 * Hook to get current vote state
 */
export function useVoteState(): VoteState {
	const ctx = useVotesContext();
	return {
		isUpvoted: ctx.currentDirection === "up",
		isDownvoted: ctx.currentDirection === "down",
		hasVoted: ctx.currentDirection !== null,
		isPending: ctx.isPending,
		total: ctx.currentVoteCount.total,
	};
}

/**
 * Hook to get upvote handler function
 */
export function useUpvote(): () => void {
	const ctx = useVotesContext();
	return ctx.handleUpvote;
}

/**
 * Hook to get downvote handler function
 */
export function useDownvote(): () => void {
	const ctx = useVotesContext();
	return ctx.handleDownvote;
}
