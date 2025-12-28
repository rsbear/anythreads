// import type { Reply } from "@anythreads/api/replies";
import type { ReplyWithNested } from "@anythreads/api/threads";
import { createContext, type PropsWithChildren, useContext } from "react";

const ReplyCtx = createContext<ReplyWithNested | undefined>(undefined);

export function useReply() {
  const reply = useContext(ReplyCtx);
  if (!reply) {
    throw new Error("useThread must be used within a ThreadProvider");
  }
  return reply;
}

export function Root({
  children,
  reply,
  className,
}: PropsWithChildren<{ reply: ReplyWithNested; className?: string }>) {
  if (!className) {
    return <ReplyCtx.Provider value={reply}>{children}</ReplyCtx.Provider>;
  }
  return (
    <ReplyCtx.Provider value={reply}>
      <div className={className}>{children}</div>
    </ReplyCtx.Provider>
  );
}

export function Body({ className }: { className?: string }) {
  const reply = useReply();
  if (!reply) return null;
  return <div className={className}>{reply.body}</div>;
}

export function CreatedAt({ className }: { className?: string }) {
  const reply = useReply();
  if (!reply) return null;
  return (
    <time dateTime={reply.createdAt} className={className}>
      {reply.createdAt}
    </time>
  );
}

export function UpdatedAt({ className }: { className?: string }) {
  const reply = useReply();
  if (!reply) return null;
  return (
    <time dateTime={reply.updatedAt} className={className}>
      {reply.updatedAt}
    </time>
  );
}

export function Replies({
  children,
}: PropsWithChildren<{
  children: (replies: ReplyWithNested[]) => React.ReactNode;
}>) {
  const reply = useReply();
  if (!reply) return null;
  if (!reply?.replies) return null;
  return children(reply.replies);
}
