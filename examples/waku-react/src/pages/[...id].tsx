import { createAnythreads } from "@anythreads/api";
import type { ReplyWithNested } from "@anythreads/api/threads";
import { Account, Reply, Thread, Vote } from "@anythreads/react";
import {
  AnythreadsPersonalization,
  ThreadPersonalization,
} from "@anythreads/react/server";
import { createClient } from "@libsql/client";
import { Link } from "waku";

const client = createClient({ url: "file:test.sqlite" });

export const anythreads = createAnythreads({
  adapter: {
    libsql: client,
  },
});

export default async function HomePage({ id }) {
  const msg = await anythreads.threads.findMany();
  console.log("id", id);

  return (
    <AnythreadsPersonalization.Provider instance={anythreads} accountId="">
      <div style={{ display: "flex" }}>
        <div style={{ width: "33%" }}>
          {msg?.kind === "some" &&
            msg.value.map((thread) => (
              <Thread.Root key={thread.id} thread={thread}>
                <Link to={`/${thread.id}`}>
                  <Thread.Title />
                </Link>
                <Thread.Body />
              </Thread.Root>
            ))}
        </div>

        {id[0] && (
          <div style={{ width: "66%", display: "flex", flexDirection: "column" }}>
            <ThreadIdSlice id={id[0]} />
          </div>
        )}
      </div>
    </AnythreadsPersonalization.Provider>
  );
}

async function ThreadIdSlice({ id }) {
  const msg = await anythreads.threads.complete(id);
  const tp = await anythreads.accounts.personalizedThread({
    threadId: id,
    accountId: "account_1",
  });
  return (
    <div>
      <h1>ThreadIdSlice: {id}</h1>
      {msg.kind === "some" && (
        <div style={{ width: "66%", display: "flex", flexDirection: "column" }}>
          <Thread.Root thread={msg.value.thread}>
            <ThreadPersonalization.Provider msg={tp}>
              <Thread.Title />
              {msg.value.replies.map((reply) => (
                <RecursiveReply key={reply.id} reply={reply} />
              ))}
              <ThreadPersonalization.None />
              <ThreadPersonalization.Err />
            </ThreadPersonalization.Provider>
          </Thread.Root>
        </div>
      )}
    </div>
  );
}

function RecursiveReply({ reply }: { reply: ReplyWithNested }) {
  return (
    <Reply.Root reply={reply} className="reply">
      <Account.Root account={reply.account} className="account-block">
        <Account.Username />
        {/* <Reply.CreatedAt /> */}
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

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
