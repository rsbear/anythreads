"use client";

import type { ReplyWithNested } from "@anythreads/api/threads";
import { createContext, type PropsWithChildren, useContext } from "react";
import { useAnythreadsPersonalization } from "../AnythreadsPersonalization/AnythreadsPersonalization.client";
import { useThread } from "../Thread/Thread.browser";

const ReplyCtx = createContext<ReplyWithNested | undefined>(undefined);

export function useReply() {
	const reply = useContext(ReplyCtx);
	if (!reply) throw new Error("useReply must be used within a Reply.Root");
	return reply;
}

export function Root({
	children,
	reply,
	className,
}: PropsWithChildren<{ reply: ReplyWithNested; className?: string }>) {
	if (!className) {
		return <ReplyCtx.Provider value={reply}>{children}</ReplyCtx.Provider>;
	}
	return (
		<ReplyCtx.Provider value={reply}>
			<div className={className}>{children}</div>
		</ReplyCtx.Provider>
	);
}

export function Body({ className }: { className?: string }) {
	const reply = useReply();
	if (!reply) return null;
	return <div className={className}>{reply.body}</div>;
}

export function CreatedAt({ className }: { className?: string }) {
	const reply = useReply();
	if (!reply) return null;
	return (
		<time dateTime={reply.createdAt} className={className}>
			{reply.createdAt}
		</time>
	);
}

export function UpdatedAt({ className }: { className?: string }) {
	const reply = useReply();
	if (!reply) return null;
	return (
		<time dateTime={reply.updatedAt} className={className}>
			{reply.updatedAt}
		</time>
	);
}

export function TotalVotes({ className }: { className?: string }) {
	const reply = useReply();
	if (!reply) return null;
	return <div className={className}>{reply.voteCount.total}</div>;
}

export function SubmitUpvote({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	const at = useAnythreadsPersonalization();
	const reply = useReply();
	const thread = useThread();

	if (!reply) return null;

	async function handleUpvoteClick() {
		if (!at.instance) {
			console.log("No anythreads instance exists in Anythreads.Root");
			return;
		} else if (!at.accountId) {
			console.log("No accountId exists in Anythreads.Root");
			return;
		} else if (!thread.id) {
			console.log("No threadId exists in Thread.Root");
			return;
		}

		const res = await at.instance.votes.create({
			accountId: at.accountId,
			threadId: thread.id,
			replyId: reply.id,
			direction: "up",
		});
		console.log("User upvoted reply", res);
		return;
	}

	return (
		<button type="button" onClick={handleUpvoteClick} className={className}>
			{children}
		</button>
	);
}

export function SubmitDownvote({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	const at = useAnythreadsPersonalization();
	const reply = useReply();
	const thread = useThread();

	if (!reply) return null;

	async function handleDownvoteClick() {
		if (!at.instance) {
			console.log("No anythreads instance exists in Anythreads.Root");
			return;
		} else if (!at.accountId) {
			console.log("No accountId exists in Anythreads.Root");
			return;
		} else if (!thread.id) {
			console.log("No threadId exists in Thread.Root");
			return;
		}

		const res = await at.instance.votes.create({
			accountId: at.accountId,
			threadId: thread.id,
			replyId: reply.id,
			direction: "down",
		});
		console.log("User downvoted reply", res);
		return;
	}

	return (
		<button type="button" onClick={handleDownvoteClick} className={className}>
			{children}
		</button>
	);
}

export function Replies({
	children,
}: PropsWithChildren<{
	children: (replies: ReplyWithNested[]) => React.ReactNode;
}>) {
	const reply = useReply();
	if (!reply) return null;
	if (!reply?.replies) return null;
	return children(reply.replies);
}
