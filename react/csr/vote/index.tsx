import type { Result } from "@anythreads/api/result";
import type { Vote } from "@anythreads/api/schema";
import type { VoteCount } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";
import { useAnythreads } from "../anythreads-ctx";
import { useCurrentAccount } from "../current-account";

type VoteContextType = {
  vote: VoteCount;
  threadId?: string;
  replyId?: string;
};

const VoteCtx = createContext<VoteContextType | undefined>(undefined);

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
