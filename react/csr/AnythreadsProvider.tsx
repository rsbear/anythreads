"use client";

// csr/provider.tsx
import type { Anythreads } from "@anythreads/api";
import { createContext, useContext } from "react";

const AnythreadsContext = createContext<Anythreads | null>(null);

/**
 * Inserts the Anythreads instance into the React tree via context
 *
 * @param instance The Anythreads instance to insert into the React tree
 * @param children The children to render
 */
export function AnythreadsProvider({
  instance,
  children,
}: {
  instance: Anythreads;
  children: React.ReactNode;
}) {
  return <AnythreadsContext.Provider value={instance}>{children}</AnythreadsContext.Provider>;
}

/**
 * Returns the Anythreads instance used by the AnythreadsProvider.
 *
 * Throws an error if the AnythreadsProvider has not been used.
 */
export function useAnythreads() {
  const ctx = useContext(AnythreadsContext);
  if (!ctx) throw new Error("useAnythreadsInstance must be used within AnythreadsProvider");
  return ctx;
}
