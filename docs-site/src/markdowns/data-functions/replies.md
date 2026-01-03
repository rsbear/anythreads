---
parent: 'Data Functions'
title: 'Replies'
---

# Replies

## create

Create a new reply to a thread or another reply.

```ts
const result = await at.replies.create({
  threadId: "thread-123",
  accountId: "account-456",
  body: "This is my reply",
  replyToId: "reply-789",        // optional, for nested replies
  extras: { edited: false },     // optional metadata
});

if (isErr(result)) return result.err;
const reply = result.data;
```

## update

Update an existing reply.

```ts
const result = await at.replies.update(replyId, {
  body: "Updated reply content",
  extras: { edited: true },
});
```

## delete

Soft delete a reply.

```ts
const result = await at.replies.delete(replyId);
```

## findOne

Find a single reply by ID.

```ts
const result = await at.replies.findOne(replyId);
if (isErr(result)) return result.err;
const reply = result.data;
```

## findMany

Find multiple replies with filtering, ordering, and pagination.

```ts
const result = await at.replies.findMany({
  where: {
    threadId: "thread-123",
    accountId: "account-456",
    replyToId: null,  // top-level replies only
  },
  order: {
    createdAt: "desc",
  },
  limit: 20,
  offset: 0,
});

if (isErr(result)) return result.err;
const replies = result.data;
```

## Types

```ts
type Reply = {
  id: string
  threadId: string
  accountId: string
  body: string
  replyToId: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  extras: Record<string, any>
}
```
