"use client";

import type { Result } from "@anythreads/api/result";
import type { Thread } from "@anythreads/api/threads";
import React, { type PropsWithChildren } from "react";

const ThreadCtx = React.createContext<Result<Thread> | undefined>(undefined);

export const useThread = () => {
  const thread = React.useContext(ThreadCtx);
  if (!thread) throw new Error("Thread not found or must be used within a Thread.Provider");
  return thread;
};

export function Provider({ thread, children }: PropsWithChildren<{ thread: Thread }>) {
  const [state] = React.useState<Result<Thread> | undefined>(() => {
    if (!thread) return undefined;
    return { isOk: true, isErr: false, data: thread, err: undefined };
  });

  return <ThreadCtx.Provider value={state}>{children}</ThreadCtx.Provider>;
}

/**
 * Returns the error message if the thread is in an error state.
 */
export function ErrMsg({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread || thread.isOk) return null;
  return <span className={className}>{thread.err.msg}</span>;
}

export function Title({ className }: { className?: string }): React.ReactElement | null {
  const thread = React.useContext(ThreadCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.title}</span>;
}

export function Body({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.body}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.createdAt}</span>;
}

export function UpdatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.updatedAt}</span>;
}
