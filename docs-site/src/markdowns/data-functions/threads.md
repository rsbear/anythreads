---
parent: 'Data Functions'
title: 'Threads'
---

# Threads

## create

Create a new thread.

```ts
const result = await at.threads.create({
  title: "My first thread",
  body: "This is the thread content",
  accountId: "account-123",
  upstreamId: "product-456",      // optional external ID
  allowReplies: true,             // default: true
  extras: { tags: ["help"] },     // optional metadata
});

if (isErr(result)) return result.err;
const thread = result.data;
```

## update

Update an existing thread.

```ts
const result = await at.threads.update(threadId, {
  title: "Updated title",
  body: "Updated content",
  allowReplies: false,
});
```

## delete

Soft delete a thread.

```ts
const result = await at.threads.delete(threadId);
```

## findOne

Find a single thread by ID.

```ts
const result = await at.threads.findOne(threadId);
if (isErr(result)) return result.err;
const thread = result.data;
```

## findMany

Find multiple threads with filtering, ordering, and pagination.

```ts
const result = await at.threads.findMany({
  where: {
    accountId: "account-123",
    upstreamId: "product-456",
  },
  order: {
    createdAt: "desc",
  },
  limit: 20,
  offset: 0,
});

if (isErr(result)) return result.err;
const threads = result.data;
```

## complete

Get a complete thread with nested replies, accounts, and vote counts.

```ts
const result = await at.threads.complete(threadId, maxReplyDepth);
if (isErr(result)) return result.err;

const { thread, replies } = result.data;
// thread has account and voteCount
// replies is a nested tree with accounts and voteCounts
```

## Types

```ts
type Thread = {
  id: string
  accountId: string
  upstreamId: string | null
  title: string
  body: string
  allowReplies: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  extras: Record<string, any>
}

type ThreadComplete = {
  thread: ThreadWithDetails
  replies: ReplyWithNested[]
}

type ThreadWithDetails = Thread & {
  account: Account
  voteCount: VoteCount
}
```
