"use client";
import type { Thread } from "@anythreads/api/threads";

import { createContext, type PropsWithChildren, useContext } from "react";

const ThreadCtx = createContext<Thread | undefined>(undefined);

export function useThread() {
  const thread = useContext(ThreadCtx);
  if (!thread) {
    throw new Error("useThread must be used within a ThreadProvider");
  }
  return thread;
}

export function Root({
  children,
  thread,
}: PropsWithChildren<{ thread: Thread }>) {
  return <ThreadCtx.Provider value={thread}>{children}</ThreadCtx.Provider>;
}

export function Title({ className }: { className?: string }) {
  const thread = useThread();
  if (!thread) return null;
  return <span className={className}>{thread.title}</span>;
}
export function Body({ className }: { className?: string }) {
  const thread = useThread();
  if (!thread) return null;
  return <div className={className}>{thread.body}</div>;
}
export function CreatedAt({ className }: { className?: string }) {
  const thread = useThread();
  if (!thread) return null;
  return (
    <time dateTime={thread.createdAt} className={className}>
      {thread.createdAt}
    </time>
  );
}
export function UpdatedAt({ className }: { className?: string }) {
  const thread = useThread();
  if (!thread) return null;
  return (
    <time dateTime={thread.updatedAt} className={className}>
      {thread.updatedAt}
    </time>
  );
}
