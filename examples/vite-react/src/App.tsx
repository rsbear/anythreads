import * as React from "react";
import "./App.css";

import { createAnythreads } from "@anythreads/api";

import type { VotesInThread } from "@anythreads/api/accounts";
import type { Msg } from "@anythreads/api/msg";
import type {
  ReplyWithNested,
  ThreadComplete,
  Thread as ThreadType,
} from "@anythreads/api/threads";
import type { Account as AccountType } from "@anythreads/api/accounts";

import { Thread, Reply, Account, Vote } from "@anythreads/react";
import {
  AnythreadsPersonalization,
  ThreadPersonalization,
} from "@anythreads/react/browser";
import { store } from "@simplestack/store";
import { useStoreValue } from "@simplestack/store/react";

const at = createAnythreads({
  adapter: {
    fetch: {
      url: "http://localhost:3000/anythreads",
      credentials: "include",
    },
  },
});

const picked = store<Msg<ThreadComplete>>({ kind: "none", value: null });
const myVotes = store<Msg<VotesInThread>>({ kind: "none", value: null });

export default function App() {
  const [msg, setMsg] = React.useState<Msg<ThreadType[]> | undefined>(
    undefined,
  );

  const complete = useStoreValue(picked);
  const threadPersonalized = useStoreValue(myVotes);

  React.useEffect(() => {
    at.threads.findMany().then(setMsg);
  }, []);

  async function handleClickToPick(id: string) {
    at.threads.complete(id).then(picked.set);
    at.accounts
      .votesInThread({
        threadId: id,
        accountId: "account_1",
      })
      .then(myVotes.set);
  }

  return (
    <AnythreadsPersonalization.Provider instance={at} accountId="account_1">
      <div style={{ display: "flex" }}>
        <div style={{ width: "33%" }}>
          {msg?.kind === "some" &&
            msg.value.map((thread) => (
              <Thread.Root key={thread.id} thread={thread}>
                <button
                  type="button"
                  onClick={() => handleClickToPick(thread.id)}
                >
                  <Thread.Title />
                </button>
                <Thread.Body />
              </Thread.Root>
            ))}
        </div>

        {complete.kind === "some" && (
          <div
            style={{ width: "66%", display: "flex", flexDirection: "column" }}
          >
            <Thread.Root thread={complete.value.thread}>
              <ThreadPersonalization.Provider
                threadPersonalized={threadPersonalized.value}
              >
                <Thread.Title />
                {complete.value.replies.map((reply) => (
                  <RecursiveReply key={reply.id} reply={reply} />
                ))}
              </ThreadPersonalization.Provider>
            </Thread.Root>
          </div>
        )}
      </div>
    </AnythreadsPersonalization.Provider>
  );
}

function RecursiveReply({ reply }: { reply: ReplyWithNested }) {
  return (
    <Reply.Root reply={reply} className="reply">
      <Account.Root account={reply.account} className="account-block">
        <Account.Username />
        <Reply.CreatedAt />
      </Account.Root>
      <Reply.Body />
      <Vote.Root vote={reply.voteCount} className="votes-block">
        <Reply.SubmitUpvote>up</Reply.SubmitUpvote>
        <Vote.Total />
        <Reply.SubmitDownvote>down</Reply.SubmitDownvote>
      </Vote.Root>
      {reply.replies.map((reply) => (
        <RecursiveReply key={reply.id} reply={reply} />
      ))}
    </Reply.Root>
  );
}
