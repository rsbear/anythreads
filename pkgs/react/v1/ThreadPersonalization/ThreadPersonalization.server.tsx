import type { VotesInThread } from "@anythreads/api/accounts";
import type { PropsWithChildren } from "react";
import { cache } from "react";
import type { ThreadPersonalizationContext } from "./types";
import type { Msg } from "@anythreads/api/msg";

// Server-side "context" using React cache
const getThreadPersonalizationCtx = cache(() => {
  return {
    msg: { kind: "none", value: null },
  } as ThreadPersonalizationContext;
});

export function useThreadPersonalization() {
  const ctx = getThreadPersonalizationCtx();
  return ctx;
}

export function Provider({
  children,
  msg,
}: PropsWithChildren<{ msg: Msg<VotesInThread> }>) {
  const ctx = getThreadPersonalizationCtx();
  ctx.msg = msg;
  return <>{children}</>;
}

export function None({ className }: { className?: string }) {
  const ctx = getThreadPersonalizationCtx();
  if (ctx.msg.kind !== "none") return null;
  return (
    <span className={className}>
      {ctx.msg.value?.reason ?? "No thread personalization"}
    </span>
  );
}

export function Err({ className }: { className?: string }) {
  const ctx = getThreadPersonalizationCtx();
  if (ctx.msg.kind !== "err") return null;
  return (
    <span className={className}>
      {ctx.msg.value?.msg ?? "Error retrieving thread personalization"}
    </span>
  );
}
