# @anythreads/react

A React library for composing threads, comments, and votes into your apps user interface.

### If you haven't already, install via
::: code-group

```sh [bun]
bun add @anythreads/react
```

```sh [deno]
deno add npm:@anythreads/react
```

```sh [pnpm]
pnpm add @anythreads/react
```

```sh [npm]
npm i @anythreads/react
```

:::

### Composable client components (incomplete)

```tsx
import { createAnythreads } from "@anythreads/api";
import { Anythreads } from "@anythreads/react/csr";

const anythreads = createAnythreads({
  fetch: { url: "http://localhost:8080/anythreads" }
})

export default function App() {
  return (
    <Anythreads.Provider value={anythreads}>
      <div>...</div>
    </Anythreads.Provider>
  )
}
```

```tsx
import { useThreads, Thread } from "@anythreads/react/csr";

export default function Threads() {
  const threads = useThreads();
  return (
    <ul>
      {threads.map(thread => (
        <Thread.Provider key={thread.id} value={thread}>
          <Thread.A href={`/thread/${thread.id}`}>
            <Thread.Title />
          </Thread.A>
          <Thread.Body />
          <Thread.CreatedAt />
          <Thread.UpdatedAt />
          <Thread.RepliesCount />
          <Thread.VotesCount />
        </Thread.Provider>
      ))}
    </ul>
  )
}
```

```tsx
import { useThreads, Thread } from "@anythreads/react/csr";

export default function ThreadIdPage({ id }) {
  const thread = useThread(id);
  return (
    <Thread.Provider key={thread.id} value={thread}>
      <Thread.Title />
      <Thread.Body />
      <Thread.CreatedAt />
      <Thread.UpdatedAt />
      <Thread.RepliesCount />
      <Thread.VotesCount />
      {thread.replies.map(reply => (
        <RecursiveReply key={reply.id} id={reply.id} />
      ))}
   </Thread.Provider>
  )
}
```

### Recursive Replies

```tsx
import { Reply } from "@anythreads/react/csr";

export default function RecursiveReply({ id }) {
  const reply = useReply(id);
  return (
    <Reply.Provider key={reply.id} value={reply}>
      <Reply.Body />
      <Reply.CreatedAt />
      <Reply.UpdatedAt />
      {reply.replies.map(reply => (
        <Reply.Provider key={reply.id} value={reply}>
          <Reply.Body />
          <Reply.CreatedAt />
          <Reply.UpdatedAt />
        </Reply.Provider>
      ))}
   </Reply.Provider>
  )
}
```
