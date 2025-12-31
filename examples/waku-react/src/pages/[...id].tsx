import { createAnythreads } from "@anythreads/api";
import type { PersonalizedThread } from "@anythreads/api/accounts";
import type { ReplyWithNested } from "@anythreads/api/threads";
import { Anythreads } from "@anythreads/react/browser";
import {
  Account,
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
    <div>
      <h1>ThreadIdSlice: {id}</h1>
      {msg.kind === "some" && (
        <div style={{ width: "66%", display: "flex", flexDirection: "column" }}>
          <Thread.Root thread={msg.value.thread}>
            <ThreadPersonalization.Provider msg={personalThread}>
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
