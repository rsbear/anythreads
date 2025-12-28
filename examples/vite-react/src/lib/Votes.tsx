import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

const VotesCtx = createContext<VoteCount | undefined>(undefined);

export function useVoteCount() {
  const vote = useContext(VotesCtx);
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
    return <VotesCtx.Provider value={vote}>{children}</VotesCtx.Provider>;
  }
  return (
    <VotesCtx.Provider value={vote}>
      <div className={className}>{children}</div>
    </VotesCtx.Provider>
  );
}

export function Total({ className }: { className?: string }) {
  const vote = useVoteCount();
  if (typeof vote?.total === "undefined") return null;
  return <span className={className}>{vote.total}</span>;
}
