import React from "react";

import type { Thread } from "@anythreads/api/threads";

const ThreadCtx = React.createContext<Thread | null>(null);

export const useThread = () => React.useContext(ThreadCtx);

export function Provider({ value, children }: { value: Thread, children: React.ReactNode }) {
  return (
    <ThreadCtx.Provider value={value}>
      {children}
    </ThreadCtx.Provider>
  )
}

export function Title({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread) return null;
  return <span className={className}>{thread.title}</span>;
}

export function Body({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread) return null;
  return <span className={className}>{thread.body}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread) return null;
  return <span className={className}>{thread.createdAt}</span>;
}

export function UpdatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCtx);
  if (!thread) return null;
  return <span className={className}>{thread.updatedAt}</span>;
}









