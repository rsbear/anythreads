"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";
import { useAnythreadsBrowser } from "../AnythreadsService.browser";
import { useCurrentAccount } from "../CurrentAccount.browser";
import { useThreadPersonalization } from "../mod";
import { useThread } from "../Thread/Thread.browser";

type CreateReplyCtx = {
  status: "empty" | "writing" | "submitting" | "success" | "error";
  setStatus: (status: CreateReplyCtx["status"]) => void;
  err: Error | null;
  setErr: (err: Error) => void;
};

const CreateReplyCtx = createContext<CreateReplyCtx>({
  status: "empty",
  setStatus: () => { },
  err: null,
  setErr: () => { },
});

export function useCreateReply() {
  const ctx = useContext(CreateReplyCtx);
  if (!ctx) {
    throw new Error("useCreateReply must be used within a Provider");
  }
  return useContext(CreateReplyCtx);
}

export function Form({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const [status, setStatus] = useState<CreateReplyCtx["status"]>("empty");
  const [err, setErr] = useState<Error | null>(null);

  const thread = useThread();
  const { accountId } = useCurrentAccount();
  const at = useAnythreadsBrowser();
  const { replyToId } = useThreadPersonalization();

  async function handleSubmit(formData: FormData) {
    const text = formData.get("reply_value");
    if (!accountId) {
      console.error("Cannot submit a reply without an account");
      return;
    }
    if (!text || typeof text !== "string") {
      console.error("Cannot submit a reply without text");
      return;
    }

    try {
      const res = await at.replies.create({
        accountId,
        threadId: thread.id,
        replyToId: replyToId,
        body: text,
      });
      if (res.kind === "err") {
        setErr(Error(res.value.msg));
      }
      console.log("res", res);
    } catch (error) {
      console.error("Failed to create reply", err);
      setStatus("error");
      setErr(error instanceof Error ? error : new Error(String(error)));
      return;
    }

    console.log("text", text);
  }

  return (
    <CreateReplyCtx.Provider value={{ status, setStatus, err, setErr }}>
      <form className={className} action={(e) => handleSubmit(e)}>
        {children}
      </form>
    </CreateReplyCtx.Provider>
  );
}

export function Textarea({ className }: { className?: string }) {
  return (
    <textarea className={className} name="reply_value" placeholder="Reply..." />
  );
}

export function SubmitButton({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  const { status } = useCreateReply();
  return (
    <button
      type="submit"
      className={className}
      disabled={status === "submitting"}
    >
      {children}
    </button>
  );
}
