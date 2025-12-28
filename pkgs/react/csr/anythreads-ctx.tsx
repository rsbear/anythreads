import type { Anythreads } from "@anythreads/api";
import React from "react";

const AnythreadsCtx = React.createContext<Anythreads | undefined>(undefined);

export const useAnythreads = () => {
  const instance = React.useContext(AnythreadsCtx);
  if (!instance) {
    throw new Error("useAnythreads must be used within a AnythreadsProvider");
  }
  return instance;
};

export function AnythreadsProvider({
  children,
  instance,
}: React.PropsWithChildren<{
  instance: Anythreads;
}>) {
  return <AnythreadsCtx.Provider value={instance}>{children}</AnythreadsCtx.Provider>;
}
