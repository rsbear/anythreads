"use client";

import { type Anythreads, createAnythreads } from "@anythreads/api";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";

const AnythreadsContext = createContext<Anythreads | undefined>(undefined);

export const useAnythreadsBrowser = () => {
  const instance = useContext(AnythreadsContext);
  if (!instance) {
    throw new Error(
      "Anythreads instance not found. Wrap your app with <Anythreads.Provider instance={anythreads}>",
    );
  }
  return instance;
};

/**
 * Client-side component of an Anythreads instance bound to react
 * This is used to for actions voting and replying
 */
export function Provider({
  children,
  url,
}: PropsWithChildren<{ url: string }>) {
  const instance = useMemo(
    () =>
      createAnythreads({ adapter: { fetch: { url, credentials: "include" } } }),
    [url],
  );
  return (
    <AnythreadsContext.Provider value={instance}>
      {children}
    </AnythreadsContext.Provider>
  );
}
