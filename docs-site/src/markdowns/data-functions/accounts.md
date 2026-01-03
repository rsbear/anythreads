---
parent: 'Data Functions'
title: 'Accounts'
---

# @anythreads/api

## Prerequisites
1. You have installed `@anythreads/api`
2. You have created an instance of Anythreads using your adapter of choice, e.g.:
```ts 
import { createAnythreads } from "@anythreads/api";
import { Database } from "bun-sqlite";
const db = new Database("file:test.db");
const at = createAnythreads({ bunSQLite: db })
```

## Usage

### Create an account
```ts
const createAccount = await at.accounts.create({ ...})
if (createAccount.isErr) return createAccount.err
```

### Find an account
```ts
const account = await at.accounts.findOne(createAccount.data.id)
if (account.isErr) return account.err
```

### Find all accounts
```ts
const accounts = await at.accounts.findAll()
if (accounts.isErr) return accounts.err
```

### Update an account
```ts
const updateAccount = await at.accounts.update(account.data.id, { ...})
if (updateAccount.isErr) return updateAccount.err
```

### Delete an account
```ts
const deleteAccount = await at.accounts.delete(account.data.id)
if (deleteAccount.isErr) return deleteAccount.err
```

### Delete all accounts
```ts
const deleteAllAccounts = await at.accounts.deleteAll()
if (deleteAllAccounts.isErr) return deleteAllAccounts.err
```

### Find all accounts with a specific property
```ts
const accounts = await at.accounts.findAll({ property: "value" })
if (accounts.isErr) return accounts.err
```


