"use client";

import type { ReplyWithNested } from "@anythreads/api/threads";
import { createContext, type PropsWithChildren, useContext } from "react";
import { useAnythreadsPersonalization } from "./browser";
import { useThread } from "./Thread";

const ReplyCtx = createContext<ReplyWithNested | undefined>(undefined);

export function useReply() {
  const reply = useContext(ReplyCtx);
  if (!reply) {
    throw new Error("useThread must be used within a ThreadProvider");
  }
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
    }

    if (!at.accountId) {
      console.log("No accountId exists in Anythreads.Root");
      return;
    }

    if (!thread.id) {
      console.log("No threadId exists in Thread.Root");
      return;
    }

    const res = await at.instance.votes.voteUpReply(
      at.accountId,
      thread.id,
      reply.id,
    );
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
    }

    if (!at.accountId) {
      console.log("No accountId exists in Anythreads.Root");
      return;
    }

    if (!thread.id) {
      console.log("No threadId exists in Thread.Root");
      return;
    }

    const res = await at.instance.votes.voteDownReply(
      at.accountId,
      thread.id,
      reply.id,
    );
    console.log("User upvoted reply", res);
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
