/**
 * Purely UI
 *
 * @module
 * */

import type { ReplyWithNested } from "@anythreads/api/replies";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { Root as VotesRoot } from "../vote";

const ReplyRootCtx = createContext<ReplyWithNested | undefined>(undefined);

export const useReply = () => {
  const reply = useContext(ReplyRootCtx);
  if (!reply) {
    throw new Error("useReply must be used within a Reply.Root");
  }
  return reply;
};

export function Root({
  reply,
  children,
  enableVotes,
}: PropsWithChildren<{
  reply: ReplyWithNested;
  enableVotes?: boolean;
}>) {
  return (
    <ReplyRootCtx.Provider value={reply}>
      {!enableVotes ? (
        children
      ) : (
        <VotesRoot vote={reply.voteCount} threadId={reply.threadId} replyId={reply.id}>
          {children}
        </VotesRoot>
      )}
    </ReplyRootCtx.Provider>
  );
}

export function Body({ className }: { className?: string }) {
  const reply = useContext(ReplyRootCtx);
  if (!reply) return null;
  return <span className={className}>{reply.body}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
  const reply = useContext(ReplyRootCtx);
  if (!reply) return null;
  return <time className={className}>{reply.createdAt}</time>;
}
