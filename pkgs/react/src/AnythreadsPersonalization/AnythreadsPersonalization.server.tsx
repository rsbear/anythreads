import type { Anythreads } from "@anythreads/api";
import type { PropsWithChildren } from "react";
import { cache } from "react";
import type { AnythreadsCtx } from "./types";

// Server-side "context" using React cache
const getAnythreadsPersonalizationCtx = cache(() => {
  return { instance: undefined, accountId: undefined } as AnythreadsCtx;
});

export function useAnythreadsPersonalization() {
  const ctx = getAnythreadsPersonalizationCtx();
  return ctx;
}

export function Provider({
  children,
  accountId,
  instance,
}: PropsWithChildren<{ accountId: string; instance: Anythreads }>) {
  const ctx = getAnythreadsPersonalizationCtx();
  ctx.instance = instance;
  ctx.accountId = accountId;
  return <>{children}</>;
}
