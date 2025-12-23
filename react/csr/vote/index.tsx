import type { Result } from "@anythreads/api/result";
import type { Vote, UserVote } from "@anythreads/api/schema";
import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useAnythreads } from "../anythreads-ctx";
import { useCurrentAccount } from "../current-account";

type VoteContextType = {
  vote: VoteCount;
  threadId?: string;
  replyId?: string;
};

const VoteCtx = createContext<VoteContextType | undefined>(undefined);

export function useThreadUserVotes(threadId: string) {
  const at = useAnythreads();
  const currentAccount = useCurrentAccount();
  const [votes, setVotes] = useState<Record<string, UserVote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentAccount.isOk || !threadId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    at.threads
      .userVotes({
        accountId: currentAccount.value.id,
        threadId,
        toHash: true,
      })
      .then((result) => {
        if (result.isOk) {
          setVotes(result.value as Record<string, UserVote>);
        }
        setLoading(false);
      });
  }, [threadId, currentAccount, at]);

  return { votes, loading };
}

export function useVote() {
  const ctx = useContext(VoteCtx);
  if (!ctx) {
    throw new Error("useVote must be used within a Vote.Root component");
  }

  const { votes } = useThreadUserVotes(ctx.threadId!);

  const key = ctx.replyId ? `reply:${ctx.replyId}` : `thread:${ctx.threadId}`;
  const userVote = votes[key];
  const currentUserDirection = userVote?.direction || "none";

  return {
    voteCount: ctx.vote,
    currentUserDirection,
    threadId: ctx.threadId,
    replyId: ctx.replyId,
  };
}

export function Root({
  children,
  vote,
  threadId,
  replyId,
}: PropsWithChildren<{
  vote: VoteCount;
  threadId?: string;
  replyId?: string;
}>) {
  return <VoteCtx.Provider value={{ vote, threadId, replyId }}>{children}</VoteCtx.Provider>;
}

export function UpvoteCount() {
  const ctx = useContext(VoteCtx);
  if (!ctx) return null;
  return <span>{ctx.vote?.upvotes ?? 0}</span>;
}

export function DownvoteCount() {
  const ctx = useContext(VoteCtx);
  if (!ctx) return null;
  return <span>{ctx.vote?.downvotes ?? 0}</span>;
}

export function UpvoteButton({
  className,
  onClick,
  children,
}: PropsWithChildren<{ className?: string; onClick?: () => void }>) {
  const ctx = useContext(VoteCtx);
  const at = useAnythreads();
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!ctx || loading || !currentAccount.isOk) return;

    const accountId = currentAccount.value.id;

    setLoading(true);
    try {
      let result: Result<Vote> | undefined;
      if (ctx.replyId && ctx.threadId) {
        result = await at.votes.voteUpReply(accountId, ctx.threadId, ctx.replyId);
      } else if (ctx.threadId) {
        result = await at.votes.voteUpThread(accountId, ctx.threadId);
      }

      if (result?.isErr) {
        console.error("Vote error:", result.err);
      }

      onClick?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      {children}
    </button>
  );
}

export function DownvoteButton({
  className,
  onClick,
  children,
}: PropsWithChildren<{
  className?: string;
  onClick?: () => void;
}>) {
  const ctx = useContext(VoteCtx);
  const at = useAnythreads();
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!ctx || loading || !currentAccount.isOk) return;

    const accountId = currentAccount.value.id;

    setLoading(true);
    try {
      let result: Result<Vote> | undefined;
      if (ctx.replyId && ctx.threadId) {
        result = await at.votes.voteDownReply(accountId, ctx.threadId, ctx.replyId);
      } else if (ctx.threadId) {
        result = await at.votes.voteDownThread(accountId, ctx.threadId);
      }

      if (result?.isErr) {
        console.error("Vote error:", result.err);
      }

      onClick?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      {children}
    </button>
  );
}
