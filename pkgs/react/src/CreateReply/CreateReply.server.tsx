import type { PropsWithChildren } from "react";
import { getCacheCurrentAccount } from "../CurrentAccount/CurrentAccount.server";
import { useThread } from "../Thread/Thread.server";
import {
  Provider as CreateReplyProvider,
  Form,
  Textarea,
  SubmitButton,
} from "./CreateReply.shared";

export function Provider({ children }: PropsWithChildren) {
  const { accountId } = getCacheCurrentAccount();
  const { thread } = useThread();

  return (
    <CreateReplyProvider
      accountId={accountId}
      threadId={thread?.id ?? ""}
      replyId={undefined}
    >
      {children}
    </CreateReplyProvider>
  );
}

export { Form, Textarea, SubmitButton };
