"use client";

import type { Anythreads } from "@anythreads/api";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { AnythreadsPersonalizationContext } from "./types";

const AnythreadsPersonalizationCtx =
  createContext<AnythreadsPersonalizationContext>({
    instance: undefined,
    accountId: undefined,
  });

export function useAnythreadsPersonalization() {
  const at = useContext(AnythreadsPersonalizationCtx);
  return at;
}

export function Provider({
  children,
  instance,
  accountId,
}: PropsWithChildren<{ accountId?: string; instance: Anythreads }>) {
  return (
    <AnythreadsPersonalizationCtx.Provider value={{ instance, accountId }}>
      {children}
    </AnythreadsPersonalizationCtx.Provider>
  );
}
