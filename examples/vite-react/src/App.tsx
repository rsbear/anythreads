import "./App.css";

import { createAnythreads } from "@anythreads/api";
import {
  Account,
  AnythreadsProvider,
  CurrentAccountProvider,
  Thread,
  Reply,
  useThreadData,
  useThreadsData,
  useCreateReply,
  Vote,
} from "@anythreads/react/csr";

const anythreads = createAnythreads({
  adapter: {
    fetch: {
      url: "http://localhost:3000/anythreads",
      credentials: "include",
    },
  },
});

function App() {
  return (
    <AnythreadsProvider instance={anythreads}>
      <CurrentAccountProvider currentAccountId="account_1">
        <Main />
      </CurrentAccountProvider>
    </AnythreadsProvider>
  );
}

function Main() {
  const { threads } = useThreadsData();
  const { pickAsync } = useThreadData();

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
    >
      <div>
        {threads?.value?.map((thread) => (
          <Thread.Root key={thread.id} thread={thread}>
            <div style={styles.flexCol}>
              <button type="button" onClick={() => pickAsync(thread.id)}>
                <Thread.Title />
              </button>

              <Thread.Body />
              <Thread.CreatedAt />
            </div>
          </Thread.Root>
        ))}
      </div>

      <FullThread />
    </div>
  );
}

function FullThread() {
  const { thread } = useThreadData();
  const { replyToThread } = useCreateReply();

  const submitReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!thread) return;
    if (!thread.isOk) return;
    const fd = new FormData(e.currentTarget);

    const bodyEl = fd.get("body") ?? "";
    const body = typeof bodyEl === "string" ? bodyEl : "";
    if (!body) return;

    const res = await replyToThread(body);

    console.log(res);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.1rem",
        alignItems: "flex-start",
      }}
    >
      {!thread || thread.isErr ? (
        <div>click an item to select</div>
      ) : (
        <Thread.Root thread={thread.value.thread} enableVotes>
          <Thread.Title />
          <Thread.Body />
          <Thread.CreatedAt />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Vote.UpvoteButton />
            <Vote.UpvoteCount />
            <Vote.DownvoteButton />
            <Vote.DownvoteCount />
          </div>
          {thread.isOk &&
            thread.value?.replies?.map((x) => (
              <Reply.Root key={x.id} reply={x} enableVotes>
                <RecursiveReply />
              </Reply.Root>
            ))}
          <form onSubmit={submitReply}>
            <textarea name="body" rows={3} />
            <button type="submit">reply</button>
          </form>
        </Thread.Root>
      )}
    </div>
  );
}

function RecursiveReply() {
  const reply = Reply.useReply();
  return (
    <div style={{ padding: "1rem", textAlign: "left" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span>-</span>
          <Account.Root account={reply.account}>
            <Account.Username />
          </Account.Root>
          <Reply.CreatedAt />
        </div>
        <Reply.Body />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Vote.UpvoteButton>↑</Vote.UpvoteButton>
          <Vote.UpvoteCount />
          <Vote.DownvoteButton>↓</Vote.DownvoteButton>
          <Vote.DownvoteCount />
        </div>
      </div>
      {reply.replies?.map((x) => (
        <Reply.Root key={x.id} reply={x} enableVotes>
          <RecursiveReply />
        </Reply.Root>
      ))}
    </div>
  );
}

export default App;

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  flexCol: {
    display: "flex",
    flexDirection: "column" as any,
    alignItems: "flex-start",
    gap: "1rem",
    padding: "1rem",
  },
};
