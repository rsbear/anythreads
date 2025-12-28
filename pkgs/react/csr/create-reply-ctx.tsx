import React from "react";

import { useAnythreads } from "./anythreads-ctx";
import { useThreadData } from "./thread-ctx";

const CreateReplyCtx = React.createContext<{
  replyToThread: (body: string) => Promise<void>;
  replyToReply: (replyId: string, body: string) => Promise<void>;
}>({
  replyToThread: async (_body: string) => {},
  replyToReply: async (_replyId: string, _body: string) => {},
});

export const useCreateReply = () => React.useContext(CreateReplyCtx);

export function CreateReplyProvider({ children }: React.PropsWithChildren) {
  const at = useAnythreads();
  const { thread } = useThreadData();

  const replyToThread = React.useCallback(
    async (body: string) => {
      if (!at) return;
      if (!thread) return;
      if (thread.isErr) {
        console.error(thread.err);
        return;
      }
      return at.replies.create({
        threadId: thread.value.thread.id,
        accountId: "account_1",
        body,
      });
    },
    [at, thread],
  );

  const replyToReply = React.useCallback(
    async (replyId: string, body: string) => {
      if (!at) return;
      if (!thread) return;
      if (thread.isErr) {
        console.error(thread.err);
        return;
      }
      return at.replies.create({
        threadId: thread.value.thread.id,
        accountId: "account_1",
        replyToId: replyId,
        body,
      });
    },
    [at, thread],
  );

  return (
    <CreateReplyCtx.Provider
      value={{
        replyToThread,
        replyToReply,
      }}
    >
      {children}
    </CreateReplyCtx.Provider>
  );
}
