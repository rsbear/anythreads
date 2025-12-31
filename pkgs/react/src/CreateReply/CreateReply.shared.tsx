"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";

type CreateReplyCtx = {
  accountId: string | undefined;
  threadId: string;
  replyId: string | undefined;
  status: "empty" | "writing" | "submitting" | "success" | "error";
  value: string;
  setStatus: (status: CreateReplyCtx["status"]) => void;
  setValue: (value: CreateReplyCtx["value"]) => void;
};

const CreateReplyCtx = createContext<CreateReplyCtx>({
  accountId: "",
  threadId: "",
  replyId: undefined,
  status: "empty",
  value: "",
  setStatus: () => { },
  setValue: () => { },
});

export function Provider({
  accountId,
  threadId,
  replyId,
  children,
  className,
}: PropsWithChildren<{
  className?: string;
  accountId: CreateReplyCtx["accountId"];
  threadId: CreateReplyCtx["threadId"];
  replyId: CreateReplyCtx["replyId"];
}>) {
  const [status, setStatus] = useState<CreateReplyCtx["status"]>("empty");
  const [value, setValue] = useState<CreateReplyCtx["value"]>("");

  const init = {
    accountId,
    threadId,
    replyId,
    status,
    value,
    setStatus,
    setValue,
  };

  if (!className) {
    return (
      <CreateReplyCtx.Provider value={init}>{children}</CreateReplyCtx.Provider>
    );
  }
  return (
    <CreateReplyCtx.Provider value={init}>
      <div className={className}>{children}</div>
    </CreateReplyCtx.Provider>
  );
}

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
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("reply_value");
    if (!text) {
      return;
    }
    console.log("text", text);
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
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
  const { status, setStatus, value } = useCreateReply();
  return (
    <button
      type="submit"
      className={className}
      disabled={status !== "empty" || value.trim() === ""}
      onClick={() => {
        setStatus("submitting");
        setTimeout(() => {
          setStatus("success");
        }, 1000);
      }}
    >
      {children}
    </button>
  );
}
