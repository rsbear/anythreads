"use client";

import type { PersonalizedThread } from "@anythreads/api/accounts";
import type { Msg } from "@anythreads/api/msg";
import * as React from "react";

type ThreadPersonalizationCtx = {
  /**
   * The personalization data for the thread
   * The data is a msg hash with keys `thread:<threadId>` and `replyId:<replyId>`
   */
  personalizationData: Msg<PersonalizedThread>;
  /**
   * A reply Id that a user has picked to reply to
   */
  replyToId: string | undefined;
  /**
   * Set the replyToId
   */
  setReplyToId: (replyToId: string | undefined) => void;
};

const ThreadPersonalizationCtx = React.createContext<ThreadPersonalizationCtx>({
  personalizationData: { kind: "none", value: { reason: "" } },
  replyToId: undefined,
  setReplyToId: () => { },
});

export function useThreadPersonalization(): ThreadPersonalizationCtx {
  const thread = React.useContext(ThreadPersonalizationCtx);
  if (!thread) {
    throw new Error(
      "ThreadPersonalization not found. Wrap your app with <ThreadPersonalization.Provider thread={thread}>",
    );
  }
  return thread;
}

/**
 * ThreadPersonalization.Provider does "use client" also hydrates on server
 *
 */
export function Provider(
  props: React.PropsWithChildren<{ thread: Msg<PersonalizedThread> }>,
) {
  const [replyToId, setReplyToId] =
    React.useState<ThreadPersonalizationCtx["replyToId"]>(undefined);

  return (
    <ThreadPersonalizationCtx.Provider
      value={{ personalizationData: props.thread, replyToId, setReplyToId }}
    >
      {props.children}
    </ThreadPersonalizationCtx.Provider>
  );
}
