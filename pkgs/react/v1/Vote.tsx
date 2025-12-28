"use client";

import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

const VoteCtx = createContext<VoteCount | undefined>(undefined);

export function useVote() {
  const vote = useContext(VoteCtx);
  if (typeof vote === "undefined") {
    throw new Error("useVoteCount must be used within a Votes.Root");
  }
  return vote;
}

export function Root({
  vote,
  children,
  className,
}: PropsWithChildren<{ vote: VoteCount; className?: string }>) {
  if (typeof className === "undefined") {
    return <VoteCtx.Provider value={vote}>{children}</VoteCtx.Provider>;
  }
  return (
    <VoteCtx.Provider value={vote}>
      <div className={className}>{children}</div>
    </VoteCtx.Provider>
  );
}

export function Total({ className }: { className?: string }) {
  const vote = useContext(VoteCtx);
  if (typeof vote?.total === "undefined") return null;
  return <span className={className}>{vote.total}</span>;
}
