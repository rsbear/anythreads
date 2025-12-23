import type { Anythreads } from "@anythreads/api";
import type React from "react";
import * as Account from "./account/index.tsx";
import { AnythreadsProvider as AnythreadsBase, useAnythreads } from "./anythreads-ctx";
import { CreateReplyProvider, useCreateReply } from "./create-reply-ctx";
import { CurrentAccountProvider, useCurrentAccount } from "./current-account";
import * as Reply from "./reply";
import * as Thread from "./thread";
import { ThreadDataProvider, useThreadData } from "./thread-ctx";
import { ThreadsDataProvider, useThreadsData } from "./threads-ctx";
import * as Vote from "./vote";

export {
  useAnythreads,
  useThreadsData,
  useThreadData,
  useCreateReply,
  useCurrentAccount,
  CurrentAccountProvider,
  Thread,
  Reply,
  Account,
  Vote,
};

// ---- An instance of anythreads bound to react

export function AnythreadsProvider({
  children,
  instance,
}: React.PropsWithChildren<{
  instance: Anythreads;
}>) {
  return (
    <AnythreadsBase instance={instance}>
      <ThreadsDataProvider>
        <ThreadDataProvider>
          <CreateReplyProvider>{children}</CreateReplyProvider>
        </ThreadDataProvider>
      </ThreadsDataProvider>
    </AnythreadsBase>
  );
}
