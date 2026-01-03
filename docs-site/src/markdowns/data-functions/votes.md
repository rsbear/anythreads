---
parent: 'Data Functions'
title: 'Votes'
---

# Votes

## create

Create a new vote on a thread or reply.

```ts
// Vote on a thread
const result = await at.votes.create({
  accountId: "account-123",
  threadId: "thread-456",
  direction: "up",  // "up" or "down"
});

// Vote on a reply
const result = await at.votes.create({
  accountId: "account-123",
  threadId: "thread-456",
  replyId: "reply-789",
  direction: "down",
});

if (isErr(result)) return result.err;
const vote = result.data;
```

## update

Change the direction of an existing vote.

```ts
const result = await at.votes.update(voteId, "up");
```

## delete

Remove a vote.

```ts
const result = await at.votes.delete(voteId);
```

## findOne

Find a single vote by ID.

```ts
const result = await at.votes.findOne(voteId);
if (isErr(result)) return result.err;
const vote = result.data;
```

## findMany

Find multiple votes with filtering, ordering, and pagination.

```ts
const result = await at.votes.findMany({
  where: {
    accountId: "account-123",
    threadId: "thread-456",
    direction: "up",
  },
  order: {
    createdAt: "desc",
  },
  limit: 20,
  offset: 0,
});

if (isErr(result)) return result.err;
const votes = result.data;
```

## Types

```ts
type Vote = {
  id: string
  threadId: string | null
  accountId: string
  replyId: string | null
  direction: "up" | "down"
  createdAt: Date
  updatedAt: Date
}
```
