import type { Thread, ThreadWithDetails } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { cache } from "react";
import { useThreadPersonalization } from "../ThreadPersonalization/ThreadPersonalization.server";
import { formatDistance } from "../utils/date-fmt";

// Allow both Thread and ThreadWithDetails (which has voteCount)
type ThreadType = Thread | ThreadWithDetails;

// Server-side "context" using React cache
const getThreadCtx = cache(() => {
	return {
		thread: undefined as ThreadType | undefined,
	};
});

export function useThread() {
	const ctx = getThreadCtx();
	return ctx;
}

export function Root({
	children,
	thread,
}: PropsWithChildren<{ thread: ThreadType }>) {
	const ctx = getThreadCtx();
	ctx.thread = thread;
	return <>{children}</>;
}

export function Title({ className }: { className?: string }) {
	const { thread } = useThread();
	if (!thread) return null;
	return <span className={className}>{thread.title}</span>;
}

export function Body({ className }: { className?: string }) {
	const { thread } = useThread();
	if (!thread) return null;
	return <div className={className}>{thread.body}</div>;
}

export function CreatedAt({ className }: { className?: string }) {
	const { thread } = useThread();
	if (!thread) return null;
	const date = formatDistance(thread.createdAt);
	return (
		<time dateTime={date} className={className}>
			{date}
		</time>
	);
}
export function UpdatedAt({ className }: { className?: string }) {
	const { thread } = useThread();
	if (!thread) return null;
	const date = formatDistance(thread.updatedAt);
	return (
		<time dateTime={date} className={className}>
			{date}
		</time>
	);
}

export function TotalVotes() {
	const { thread } = useThread();
	// voteCount is only available on ThreadWithDetails
	const threadWithVotes = thread as ThreadWithDetails | undefined;
	return <>{threadWithVotes?.voteCount?.total ?? 0}</>;
}

/**
 * Vote state passed to render prop children
 */
export type VoteState = {
	isUpvoted: boolean;
	isDownvoted: boolean;
	hasVoted: boolean;
	isFetching: boolean;
};

/**
 * Server action function signature for vote actions.
 * Developers implement this in their app with access to their anythreads instance.
 */
export type VoteActionFn = (formData: FormData) => Promise<void>;

type SubmitVoteProps = {
	/** Server action to handle the vote - developer provides this from their app */
	action: VoteActionFn;
	className?: string;
	children?: React.ReactNode | ((state: VoteState) => React.ReactNode);
};

export function SubmitUpvote({ action, children, className }: SubmitVoteProps) {
	const { thread } = useThread();
	const personalization = useThreadPersonalization();

	if (!thread) return null;

	// Look up current vote from personalization data
	const voteKey = `thread:${thread.id}`;
	const vote =
		personalization.msg?.kind === "some"
			? personalization.msg.value?.[voteKey]
			: null;

	const isUpvoted = vote?.direction === "up";
	const isDownvoted = vote?.direction === "down";
	const hasVoted = !!vote;

	const state: VoteState = {
		isUpvoted,
		isDownvoted,
		hasVoted,
		isFetching: false,
	};

	// If children is a render prop, use it
	if (typeof children === "function") {
		return (
			<form action={action} className={className}>
				<input type="hidden" name="threadId" value={thread.id} />
				<input type="hidden" name="voteDirection" value="up" />
				<input
					type="hidden"
					name="currentDirection"
					value={vote?.direction || ""}
				/>
				{children(state)}
			</form>
		);
	}

	// Otherwise, render children inside a form with a default button
	return (
		<form action={action} className={className}>
			<input type="hidden" name="threadId" value={thread.id} />
			<input type="hidden" name="voteDirection" value="up" />
			<input
				type="hidden"
				name="currentDirection"
				value={vote?.direction || ""}
			/>
			<button type="submit">
				{children || (isUpvoted ? "Upvoted" : "Upvote")}
			</button>
		</form>
	);
}

export function SubmitDownvote({
	action,
	children,
	className,
}: SubmitVoteProps) {
	const { thread } = useThread();
	const personalization = useThreadPersonalization();

	if (!thread) return null;

	// Look up current vote from personalization data
	const voteKey = `thread:${thread.id}`;
	const vote =
		personalization.msg?.kind === "some"
			? personalization.msg.value?.[voteKey]
			: null;

	const isUpvoted = vote?.direction === "up";
	const isDownvoted = vote?.direction === "down";
	const hasVoted = !!vote;

	const state: VoteState = {
		isUpvoted,
		isDownvoted,
		hasVoted,
		isFetching: false,
	};

	// If children is a render prop, use it
	if (typeof children === "function") {
		return (
			<form action={action} className={className}>
				<input type="hidden" name="threadId" value={thread.id} />
				<input type="hidden" name="voteDirection" value="down" />
				<input
					type="hidden"
					name="currentDirection"
					value={vote?.direction || ""}
				/>
				{children(state)}
			</form>
		);
	}

	// Otherwise, render children inside a form with a default button
	return (
		<form action={action} className={className}>
			<input type="hidden" name="threadId" value={thread.id} />
			<input type="hidden" name="voteDirection" value="down" />
			<input
				type="hidden"
				name="currentDirection"
				value={vote?.direction || ""}
			/>
			<button type="submit">
				{children || (isDownvoted ? "Downvoted" : "Downvote")}
			</button>
		</form>
	);
}
