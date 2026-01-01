"use client";

import type { ReplyWithNested } from "@anythreads/api/threads";
import * as React from "react";
import { Body, CreatedAt, ReplyToThisButton, UpdatedAt } from "./composables";

const ReplyCtx = React.createContext<ReplyWithNested | undefined>(undefined);

export function useReply(): ReplyWithNested {
  const reply = React.useContext(ReplyCtx);
  if (!reply) {
    throw new Error(
      "Reply not found. Wrap your app with <Reply.Provider reply={reply}>",
    );
  }
  return reply;
}

/**
 * Reply.Provider does "use client" also ssr's and hydrates
 *
 */
export function Provider(
  props: React.PropsWithChildren<{
    reply: ReplyWithNested;
    className?: string;
  }>,
) {
  if (!props?.className) {
    <ReplyCtx.Provider value={props.reply}>{props.children}</ReplyCtx.Provider>;
  }
  return (
    <ReplyCtx.Provider value={props.reply}>
      <div className={props.className}>{props.children}</div>
    </ReplyCtx.Provider>
  );
}

export { Body, CreatedAt, UpdatedAt, ReplyToThisButton };
