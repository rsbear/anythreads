"use client";

import type { PropsWithChildren } from "react";
import { useCurrentAccount } from "../CurrentAccount/CurrentAccount.browser";
import { useThread } from "../Thread/Thread.browser";
import { Provider as CreateReplyProvider } from "./CreateReply.shared";

export function Provider({ children }: PropsWithChildren) {
  const { accountId } = useCurrentAccount();
  const thread = useThread();

  return (
    <CreateReplyProvider
      accountId={accountId}
      threadId={thread.id}
      replyId={undefined}
    >
      {children}
    </CreateReplyProvider>
  );
}
