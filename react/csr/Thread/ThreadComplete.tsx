import type { Result } from "@anythreads/api/result";
import type { ThreadComplete } from "@anythreads/api/threads";
import React, { type PropsWithChildren } from "react";
import { useAnythreads } from "../AnythreadsProvider";

const ThreadCompleteCtx = React.createContext<Result<ThreadComplete> | undefined>(undefined);

export const useThreadComplete = () => {
  const thread = React.useContext(ThreadCompleteCtx);
  if (!thread) throw new Error("Thread not found or must be used within a ThreadComplete.Provider");
  return thread;
};

export function Provider({ id, children }: PropsWithChildren<{ id: string }>) {
  const [state, setState] = React.useState<Result<ThreadComplete> | undefined>(undefined);

  const at = useAnythreads();

  React.useEffect(() => {
    if (!at) throw new Error("useAnythreads must be used within a AnythreadsProvider");
    if (id) at.threads.complete(id).then(setState);
  }, [id, at]);

  return <ThreadCompleteCtx.Provider value={state}>{children}</ThreadCompleteCtx.Provider>;
}

/**
 * Returns the error message if the ThreadComplete is in an error state.
 * if threadComplete.isOk, returns null.
 */
export function ErrMsg({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCompleteCtx);
  if (!thread || thread.isOk) return null;
  return <span className={className}>{thread.err.msg}</span>;
}

export function Title({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCompleteCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.thread.title}</span>;
}

export function Body({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCompleteCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.thread.body}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCompleteCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.thread.createdAt}</span>;
}

export function UpdatedAt({ className }: { className?: string }) {
  const thread = React.useContext(ThreadCompleteCtx);
  if (!thread || thread.isErr) return null;
  return <span className={className}>{thread.data.thread.updatedAt}</span>;
}
