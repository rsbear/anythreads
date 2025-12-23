/**
 * Purely UI
 * */
import type { Thread, ThreadWithDetails } from "@anythreads/api/threads";
import React from "react";
import { Root as VotesRoot } from "../vote";

const ThreadRootCtx = React.createContext<Thread | ThreadWithDetails | undefined>(undefined);

export function Root({
  thread,
  children,
  enableVotes,
}: React.PropsWithChildren<{
  thread: Thread | ThreadWithDetails;
  enableVotes?: boolean;
}>) {
  const hasVoteCount = "voteCount" in thread;

  return (
    <ThreadRootCtx.Provider value={thread}>
      {!enableVotes || !hasVoteCount ? (
        children
      ) : (
        <VotesRoot vote={thread.voteCount} threadId={thread.id}>
          {children}
        </VotesRoot>
      )}
    </ThreadRootCtx.Provider>
  );
}

export function Title({ className }: { className?: string }) {
  const thread = React.useContext(ThreadRootCtx);
  if (!thread) return null;
  return <span>{thread.title}</span>;
}

export function Body({ className }: { className?: string }) {
  const thread = React.useContext(ThreadRootCtx);
  if (!thread) return null;
  return <span>{thread.body}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadRootCtx);
  if (!thread) return null;
  return <time>{thread.createdAt}</time>;
}
