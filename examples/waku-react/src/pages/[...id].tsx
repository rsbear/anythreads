import { createAnythreads } from "@anythreads/api";
import type { ReplyWithNested } from "@anythreads/api/threads";
import { Anythreads } from "@anythreads/react/browser";
import {
  Account,
  CreateReply,
  CurrentAccount,
  Reply,
  Thread,
  ThreadPersonalization,
  Votes,
} from "@anythreads/react/server";
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
    <Anythreads.Provider url="http://localhost:3001/api">
      <CurrentAccount.Provider accountId="account_1">
        <div className="app">
          <div className="left-col">
            {msg?.kind === "some" &&
              msg.value.map((thread) => (
                <div key={thread.id}>
                  <Thread.Root key={thread.id} thread={thread}>
                    <Link to={`/${thread.id}`} className="text-blue-500 underline">
                      <Thread.Title />
                    </Link>
                    <Thread.Body />
                  </Thread.Root>
                </div>
              ))}
          </div>

          <div className="right-col">{id[0] && <ThreadIdSlice id={id[0]} />}</div>
        </div>
      </CurrentAccount.Provider>
    </Anythreads.Provider>
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
        <Thread.Root thread={msg.value.thread}>
          <ThreadPersonalization.Provider msg={personalThread}>
            <CreateReply.Provider>
              <Thread.Title />
              {msg.value.replies.map((reply) => (
                <RecursiveReply key={reply.id} reply={reply} />
              ))}
              <ThreadPersonalization.None />
              <ThreadPersonalization.Err />
              <div className="form-container">
                <CreateReply.Form>
                  <CreateReply.Textarea />
                  <CreateReply.SubmitButton>submit</CreateReply.SubmitButton>
                </CreateReply.Form>
              </div>
            </CreateReply.Provider>
          </ThreadPersonalization.Provider>
        </Thread.Root>
      )}
    </>
  );
}

async function RecursiveReply({ reply }: { reply: ReplyWithNested }) {
  return (
    <Reply.Root reply={reply} className="reply">
      <div className="reply-contents">
        <Account.Root account={reply.account} className="account-block">
          <Account.Username />
          {/* <Reply.CreatedAt /> */}
        </Account.Root>
        <Reply.Body />

        <Votes.Root vote={reply.voteCount} className="votes-block">
          <UpvoteBtn />
          <Total />
          <DownvoteBtn />
        </Votes.Root>
      </div>
      {reply.replies.map((nestedReply) => (
        <RecursiveReply key={nestedReply.id} reply={nestedReply} />
      ))}
    </Reply.Root>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
