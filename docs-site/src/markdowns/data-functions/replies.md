---
parent: 'Data Functions'
title: 'Replies'
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
