import { createAnythreads } from "@anythreads/api";
import type { ReplyWithNested } from "@anythreads/api/threads";
import {
  Account,
  AnythreadsService,
  CreateReply,
  CurrentAccount,
  Reply,
  Thread,
  ThreadPersonalization,
  Vote,
} from "@anythreads/react";
import { Link } from "waku";
import { DownvoteBtn, Total, UpvoteBtn } from "../islands/VotingBlock";

export const anythreads = createAnythreads({
  adapter: {
    fetch: {
      url: "http://localhost:3001/api",
      credentials: "include",
    },
  },
});

export default async function HomePage({ id }) {
  const msg = await anythreads.threads.findMany();

  return (
    <AnythreadsService.Provider url="http://localhost:3001/api">
      <CurrentAccount.Provider accountId="account_1">
        <div className="app">
          <div className="left-col">
            {msg?.kind === "some" &&
              msg.value.map((thread) => (
                <div key={thread.id}>
                  <Thread.Provider thread={thread}>
                    <Link to={`/${thread.id}`} className="text-blue-500 underline">
                      <Thread.Title />
                    </Link>
                    <Thread.Body />
                  </Thread.Provider>
                </div>
              ))}
          </div>

          <div className="right-col">{id[0] && <ThreadIdSlice id={id[0]} />}</div>
        </div>
      </CurrentAccount.Provider>
    </AnythreadsService.Provider>
  );
}

async function ThreadIdSlice({ id }) {
  const msg = await anythreads.threads.complete(id);
  const personalThread = await anythreads.accounts.personalizedThread({
    threadId: id,
    accountId: "account_1",
  });

  return (
    <>
      <h1>ThreadIdSlice: {id}</h1>
      {msg.kind === "some" && (
        <Thread.Provider thread={msg.value.thread}>
          <ThreadPersonalization.Provider thread={personalThread}>
            <Thread.Title />
            {msg.value.replies.map((reply) => (
              <RecursiveReply key={reply.id} reply={reply} />
            ))}
            <div className="form-container">
              <CreateReply.Form>
                <CreateReply.Textarea />
                <CreateReply.SubmitButton>submit</CreateReply.SubmitButton>
              </CreateReply.Form>
            </div>
          </ThreadPersonalization.Provider>
        </Thread.Provider>
      )}
    </>
  );
}

async function RecursiveReply({ reply }: { reply: ReplyWithNested }) {
  return (
    <Reply.Provider reply={reply} className="reply">
      <div className="reply-contents">
        <Account.Provider account={reply.account} className="account-block">
          <Account.Username />
          {/* <Reply.CreatedAt /> */}
        </Account.Provider>
        <Reply.Body />

        <Vote.Root className="votes-block">
          <UpvoteBtn />
          <Total />
          <DownvoteBtn />
          <Reply.ReplyToThisButton>Reply to this</Reply.ReplyToThisButton>
        </Vote.Root>
      </div>
      {reply.replies.map((nestedReply) => (
        <RecursiveReply key={nestedReply.id} reply={nestedReply} />
      ))}
    </Reply.Provider>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
