import type { ReplyWithNested } from "@anythreads/api/threads";
import { cache, type PropsWithChildren } from "react";
import { getCacheCurrentAccount } from "../CurrentAccount/CurrentAccount.server";
import { useThread } from "../Thread/Thread.server";
import { useThreadPersonalization } from "./../ThreadPersonalization/ThreadPersonalization.server";
import { formatDistance } from "../utils/date-fmt";

// Server-side "context" using React cache
const getReplyCtx = cache(() => {
	return {
		reply: undefined as ReplyWithNested | undefined,
	};
});

export function getCacheReply() {
	const ctx = getReplyCtx();
	return ctx;
}

export async function Root({
	children,
	reply,
	className,
}: PropsWithChildren<{ reply: ReplyWithNested; className?: string }>) {
	const ctx = getReplyCtx();
	ctx.reply = reply;
	if (!className) return <>{children}</>;
	return <div className={className}>{children}</div>;
}

export async function Body() {
	const ctx = getReplyCtx();
	return <>{ctx.reply?.body}</>;
}

export async function CreatedAt(_props: { className?: string }) {
	const ctx = getReplyCtx();
	if (!ctx.reply) return null;
	const date = formatDistance(ctx.reply.createdAt);
	return <time>{date}</time>;
}

export async function UpdatedAt() {
	const ctx = getReplyCtx();
	if (!ctx.reply) return null;
	const date = formatDistance(ctx.reply.updatedAt);
	return <time>{date}</time>;
}

export async function TotalVotes() {
	const ctx = getReplyCtx();
	return <>{ctx.reply?.voteCount.total}</>;
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

/**
 * DEPRECATED.
 * The form includes hidden fields: replyId, threadId, voteDirection, currentDirection
 */
export async function SubmitUpvote({
	action,
	children,
	className,
}: SubmitVoteProps) {
	const { reply } = getCacheReply();
	const { thread } = useThread();
	const { accountId } = getCacheCurrentAccount();
	const personalization = useThreadPersonalization();

	if (!reply) return null;

	// Look up current vote from personalization data
	const voteKey = `reply:${reply.id}`;
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
				<input type="hidden" name="accountId" value={accountId || ""} />
				<input type="hidden" name="voteId" value={vote?.id ?? ""} />
				<input type="hidden" name="replyId" value={reply.id} />
				<input type="hidden" name="threadId" value={thread?.id || ""} />
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
			<input type="hidden" name="accountId" value={accountId || ""} />
			<input type="hidden" name="voteId" value={vote?.id ?? ""} />
			<input type="hidden" name="replyId" value={reply.id} />
			<input type="hidden" name="threadId" value={thread?.id || ""} />
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

/**
 * DEPRECATED.
 * The form includes hidden fields: replyId, threadId, voteDirection, currentDirection
 */
export async function SubmitDownvote({
	action,
	children,
	className,
}: SubmitVoteProps) {
	const { reply } = getCacheReply();
	const { thread } = useThread();
	const { accountId } = getCacheCurrentAccount();
	const personalization = useThreadPersonalization();

	if (!reply) return null;

	// Look up current vote from personalization data
	const voteKey = `reply:${reply.id}`;
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
				<input type="hidden" name="accountId" value={accountId || ""} />
				<input type="hidden" name="voteId" value={vote?.id ?? ""} />
				<input type="hidden" name="replyId" value={reply.id} />
				<input type="hidden" name="threadId" value={thread?.id || ""} />
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
			<input type="hidden" name="accountId" value={accountId || ""} />
			<input type="hidden" name="voteId" value={vote?.id ?? ""} />
			<input type="hidden" name="replyId" value={reply.id} />
			<input type="hidden" name="threadId" value={thread?.id || ""} />
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
