"use client";

import type { Thread } from "@anythreads/api/threads";
import * as React from "react";
import { Body, Title } from "./composables.tsx";

const ThreadCtx = React.createContext<Thread | undefined>(undefined);

export function useThread(): Thread {
  const thread = React.useContext(ThreadCtx);
  if (!thread) {
    throw new Error(
      "Thread not found. Wrap your app with <Thread.Provider thread={thread}>",
    );
  }
  return thread;
}

/**
 * Thread.Provider does "use client" also hydrates on server
 *
 */
export function Provider(props: React.PropsWithChildren<{ thread: Thread }>) {
  return (
    <ThreadCtx.Provider value={props.thread}>
      {props.children}
    </ThreadCtx.Provider>
  );
}

export { Title, Body };
