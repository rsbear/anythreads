"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

type CurrentAccountT = {
  accountId: string | undefined;
};

const CurrentAccountCtx = createContext<CurrentAccountT>({
  accountId: undefined,
});

export function useCurrentAccount() {
  const ctx = useContext(CurrentAccountCtx);
  return ctx;
}

export function Provider({
  children,
  accountId,
}: PropsWithChildren<{ accountId: string }>) {
  return (
    <CurrentAccountCtx.Provider value={{ accountId }}>
      {children}
    </CurrentAccountCtx.Provider>
  );
}
