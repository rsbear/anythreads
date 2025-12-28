"use client";

import type { Anythreads } from "@anythreads/api";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { ThreadPersonalizationContext } from "./types";

const ThreadPersonalizationCtx = createContext<ThreadPersonalizationContext>({
  instance: undefined,
  accountId: undefined,
});

export function useThreadPersonalization() {
  const at = useContext(ThreadPersonalizationCtx);
  return at;
}

export function Provider({
  children,
  instance,
  accountId,
}: PropsWithChildren<{ accountId?: string; instance: Anythreads }>) {
  return (
    <ThreadPersonalizationCtx.Provider value={{ instance, accountId }}>
      {children}
    </ThreadPersonalizationCtx.Provider>
  );
}
