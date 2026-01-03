---
parent: 'React'
title: 'React'
---

# @anythreads/react

Composable React components for building thread-based UIs.

```sh
bun add @anythreads/react
```

## Setup

### AnythreadsService.Provider

Wrap your app with the Anythreads provider.

```tsx
import { AnythreadsService } from "@anythreads/react";

export default function App() {
  return (
    <AnythreadsService.Provider url="https://api.example.com/anythreads">
      {/* Your app */}
    </AnythreadsService.Provider>
  );
}
```

### CurrentAccount.Provider

Provide the current user's account ID for voting and replying.

```tsx
import { CurrentAccount } from "@anythreads/react";

<CurrentAccount.Provider accountId={user.id}>
  {/* Thread components */}
</CurrentAccount.Provider>
```

## Thread Components

### Thread.Provider

Provides thread context to child components.

```tsx
import { Thread } from "@anythreads/react";

<Thread.Provider thread={thread}>
  <Thread.Title />
  <Thread.Body />
</Thread.Provider>
```

### Thread.Title / Thread.Body

Display thread content.

```tsx
<Thread.Title className="text-2xl font-bold" />
<Thread.Body className="text-gray-700" />
```

### useThread

Access thread data from context.

```tsx
import { useThread } from "@anythreads/react";

function CustomThreadComponent() {
  const thread = useThread();
  return <div>{thread.title}</div>;
}
```

## Reply Components

### Reply.Provider

Provides reply context to child components.

```tsx
import { Reply } from "@anythreads/react";

<Reply.Provider reply={reply} className="ml-4">
  <Reply.Body />
  <Reply.CreatedAt />
  <Reply.ReplyToThisButton>Reply</Reply.ReplyToThisButton>
</Reply.Provider>
```

### Reply Components

```tsx
<Reply.Body className="text-sm" />
<Reply.CreatedAt className="text-gray-500 text-xs" />
<Reply.UpdatedAt className="text-gray-500 text-xs" />
<Reply.ReplyToThisButton className="text-blue-500">
  Reply
</Reply.ReplyToThisButton>
```

### useReply

Access reply data from context.

```tsx
import { useReply } from "@anythreads/react";

function CustomReplyComponent() {
  const reply = useReply();
  return <div>{reply.body}</div>;
}
```

### Nested Replies Example

```tsx
function RecursiveReply({ reply }) {
  return (
    <Reply.Provider reply={reply}>
      <Reply.Body />
      <Reply.CreatedAt />
      {reply.replies.map((nestedReply) => (
        <RecursiveReply key={nestedReply.id} reply={nestedReply} />
      ))}
    </Reply.Provider>
  );
}
```

## Account Components

### Account.Provider

Provides account context.

```tsx
import { Account } from "@anythreads/react";

<Account.Provider account={reply.account}>
  <Account.Avatar />
  <Account.Username />
</Account.Provider>
```

### Account Components

```tsx
<Account.Username className="font-semibold" />
<Account.Avatar className="w-8 h-8 rounded-full" />
<Account.Badge className="text-xs" />
```

### useAccount

```tsx
import { useAccount } from "@anythreads/react";

function CustomAccountComponent() {
  const account = useAccount();
  return <span>@{account.username}</span>;
}
```

## Vote Components

### Vote.Root

Provides voting context. Must be inside Thread/Reply providers.

```tsx
import { Vote } from "@anythreads/react";

<Vote.Root className="flex items-center gap-2">
  <Vote.UpvoteButton />
  <Vote.Total />
  <Vote.DownvoteButton />
</Vote.Root>
```

### Vote Components

```tsx
// Simple buttons
<Vote.UpvoteButton className="text-blue-500">↑</Vote.UpvoteButton>
<Vote.DownvoteButton className="text-red-500">↓</Vote.DownvoteButton>
<Vote.Total className="font-bold" />

// Render prop pattern with state
<Vote.UpvoteButton>
  {({ isUpvoted, isPending }) => (
    <span className={isUpvoted ? "text-blue-600" : "text-gray-400"}>
      ↑ {isPending && "..."}
    </span>
  )}
</Vote.UpvoteButton>

<Vote.Total>
  {({ total, isPending }) => (
    <span>{isPending ? "..." : total}</span>
  )}
</Vote.Total>
```

### Vote Hooks

```tsx
import { useVoteState, useUpvote, useDownvote } from "@anythreads/react";

function CustomVoteComponent() {
  const { isUpvoted, isDownvoted, total, isPending } = useVoteState();
  const upvote = useUpvote();
  const downvote = useDownvote();

  return (
    <div>
      <button onClick={upvote} disabled={isPending}>
        {isUpvoted ? "↑ Upvoted" : "↑ Upvote"}
      </button>
      <span>{total}</span>
      <button onClick={downvote} disabled={isPending}>
        {isDownvoted ? "↓ Downvoted" : "↓ Downvote"}
      </button>
    </div>
  );
}
```

## CreateReply Components

### CreateReply.Form

Form for creating new replies.

```tsx
import { CreateReply } from "@anythreads/react";

<CreateReply.Form className="mt-4">
  <CreateReply.Textarea className="w-full border rounded p-2" />
  <CreateReply.SubmitButton className="mt-2 px-4 py-2 bg-blue-500 text-white">
    Submit Reply
  </CreateReply.SubmitButton>
</CreateReply.Form>
```

### useCreateReply

Access form state.

```tsx
import { useCreateReply } from "@anythreads/react";

function ReplyStatus() {
  const { status, err } = useCreateReply();
  if (status === "error") return <div>Error: {err?.message}</div>;
  if (status === "submitting") return <div>Submitting...</div>;
  return null;
}
```

## ThreadPersonalization

### ThreadPersonalization.Provider

Provides personalized vote data and reply-to state.

```tsx
import { ThreadPersonalization } from "@anythreads/react";

<ThreadPersonalization.Provider thread={personalizedData}>
  {/* Thread with votes and replies */}
</ThreadPersonalization.Provider>
```

### useThreadPersonalization

```tsx
import { useThreadPersonalization } from "@anythreads/react";

function ReplyTarget() {
  const { replyToId, setReplyToId } = useThreadPersonalization();
  return (
    <div>
      {replyToId ? (
        <div>
          Replying to {replyToId}
          <button onClick={() => setReplyToId(undefined)}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
}
```

## Complete Example

```tsx
import {
  AnythreadsService,
  CurrentAccount,
  Thread,
  Reply,
  Account,
  Vote,
  CreateReply,
  ThreadPersonalization,
} from "@anythreads/react";

export default function ThreadPage({ threadData, personalizedData, userId }) {
  return (
    <AnythreadsService.Provider url="https://api.example.com">
      <CurrentAccount.Provider accountId={userId}>
        <ThreadPersonalization.Provider thread={personalizedData}>
          <Thread.Provider thread={threadData.thread}>
            <div>
              {/* Thread header */}
              <Account.Provider account={threadData.thread.account}>
                <Account.Avatar />
                <Account.Username />
              </Account.Provider>

              {/* Thread content */}
              <Thread.Title className="text-2xl font-bold" />
              <Thread.Body className="mt-2" />

              {/* Thread votes */}
              <Vote.Root className="flex gap-2 mt-4">
                <Vote.UpvoteButton>↑</Vote.UpvoteButton>
                <Vote.Total />
                <Vote.DownvoteButton>↓</Vote.DownvoteButton>
              </Vote.Root>

              {/* Reply form */}
              <CreateReply.Form className="mt-4">
                <CreateReply.Textarea className="w-full border p-2" />
                <CreateReply.SubmitButton className="mt-2">
                  Reply
                </CreateReply.SubmitButton>
              </CreateReply.Form>

              {/* Replies */}
              {threadData.replies.map((reply) => (
                <Reply.Provider key={reply.id} reply={reply} className="ml-4 mt-4">
                  <Account.Provider account={reply.account}>
                    <Account.Username />
                  </Account.Provider>
                  <Reply.Body />
                  <Reply.CreatedAt />
                  <Vote.Root>
                    <Vote.UpvoteButton />
                    <Vote.Total />
                    <Vote.DownvoteButton />
                  </Vote.Root>
                  <Reply.ReplyToThisButton>Reply</Reply.ReplyToThisButton>
                </Reply.Provider>
              ))}
            </div>
          </Thread.Provider>
        </ThreadPersonalization.Provider>
      </CurrentAccount.Provider>
    </AnythreadsService.Provider>
  );
}
```
