---
parent: 'Data Functions'
title: 'Accounts'
---

# Accounts

## create

Create a new account.

```ts
const result = await at.accounts.create({
  username: "alice",
  email: "alice@example.com",
  avatar: "https://example.com/avatar.png",
  upstreamId: "firebase-uid-123",  // optional external ID
  badge: "moderator",               // optional badge
  extras: { bio: "Hello!" },        // optional metadata
});

if (isErr(result)) return result.err;
const account = result.data;
```

## update

Update an existing account.

```ts
const result = await at.accounts.update(accountId, {
  username: "alice_updated",
  avatar: "https://example.com/new-avatar.png",
});
```

## delete

Soft delete an account.

```ts
const result = await at.accounts.delete(accountId);
```

## ban / unban

Ban or unban an account.

```ts
// Ban until specific date
const result = await at.accounts.ban(accountId, new Date("2026-12-31"));

// Ban permanently
const result = await at.accounts.ban(accountId, null);

// Unban
const result = await at.accounts.unban(accountId);
```

## findOne

Find a single account by ID.

```ts
const result = await at.accounts.findOne(accountId);
if (isErr(result)) return result.err;
const account = result.data;
```

## findMany

Find multiple accounts with filtering, ordering, and pagination.

```ts
const result = await at.accounts.findMany({
  where: {
    upstreamId: "firebase-uid-123",
  },
  order: {
    createdAt: "desc",
  },
  limit: 20,
  offset: 0,
});

if (isErr(result)) return result.err;
const accounts = result.data;
```

## personalizedThread

Get a thread with user-specific vote information.

```ts
const result = await at.accounts.personalizedThread({
  accountId: "account-123",
  threadId: "thread-456",
});
```

## Types

```ts
type Account = {
  id: string
  upstreamId: string | null
  username: string
  email: string | null
  avatar: string | null
  badge: string | null
  banned: boolean
  bannedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  extras: Record<string, any>
}
```

