import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "../core/executor.ts";

interface SeedData {
  accounts: Array<{
    id: string;
    upstreamId: string;
    username: string;
    email: string;
    badge: string | null;
  }>;
  threads: Array<{
    id: string;
    accountId: string;
    upstreamId: string;
    title: string;
    body: string;
    allowReplies: boolean;
  }>;
  replies: Array<{
    id: string;
    threadId: string;
    accountId: string;
    body: string;
    replyToId: string;
  }>;
  votes: Array<{
    id: string;
    threadId: string | null;
    accountId: string;
    replyId: string | null;
    direction: "up" | "down";
  }>;
}

function loadSeedData(): SeedData {
  const seedFilePath = join(import.meta.dir, "../seed.json");
  const seedFileContent = readFileSync(seedFilePath, "utf-8");
  return JSON.parse(seedFileContent);
}

async function seedAccounts(config: any): Promise<void> {
  const seedData = loadSeedData();
  console.log(`Seeding ${seedData.accounts.length} accounts...`);

  for (const account of seedData.accounts) {
    const now = Date.now();
    const extras = JSON.stringify({});

    if (config.dbType === "bun_sqlite") {
      config.db.run(
        `INSERT INTO accounts (id, upstream_id, username, email, badge, banned, banned_at, created_at, updated_at, extras)
         VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?)`,
        account.id,
        account.upstreamId,
        account.username,
        account.email,
        account.badge,
        now,
        now,
        extras,
      );
    } else {
      await config.db.query(
        `INSERT INTO accounts (id, upstream_id, username, email, badge, banned, banned_at, created_at, updated_at, extras)
         VALUES ($1, $2, $3, $4, $5, false, NULL, $6, $7, $8)`,
        [
          account.id,
          account.upstreamId,
          account.username,
          account.email,
          account.badge,
          now,
          now,
          {},
        ],
      );
    }
  }

  console.log(`Seeded ${seedData.accounts.length} accounts`);
}

async function seedThreads(config: any): Promise<void> {
  const seedData = loadSeedData();
  console.log(`Seeding ${seedData.threads.length} threads...`);

  for (const thread of seedData.threads) {
    const now = Date.now();
    const extras = JSON.stringify({});

    if (config.dbType === "bun_sqlite") {
      config.db.run(
        `INSERT INTO threads (id, account_id, upstream_id, title, body, allow_replies, created_at, updated_at, extras)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        thread.id,
        thread.accountId,
        thread.upstreamId,
        thread.title,
        thread.body,
        thread.allowReplies ? 1 : 0,
        now,
        now,
        extras,
      );
    } else {
      await config.db.query(
        `INSERT INTO threads (id, account_id, upstream_id, title, body, allow_replies, created_at, updated_at, extras)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          thread.id,
          thread.accountId,
          thread.upstreamId,
          thread.title,
          thread.body,
          thread.allowReplies,
          now,
          now,
          {},
        ],
      );
    }
  }

  console.log(`Seeded ${seedData.threads.length} threads`);
}

async function seedReplies(config: any): Promise<void> {
  const seedData = loadSeedData();
  console.log(`Seeding ${seedData.replies.length} replies...`);

  for (const reply of seedData.replies) {
    const now = Date.now();
    const extras = JSON.stringify({});

    if (config.dbType === "bun_sqlite") {
      config.db.run(
        `INSERT INTO replies (id, thread_id, account_id, body, reply_to_id, created_at, updated_at, extras)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        reply.id,
        reply.threadId,
        reply.accountId,
        reply.body,
        reply.replyToId,
        now,
        now,
        extras,
      );
    } else {
      await config.db.query(
        `INSERT INTO replies (id, thread_id, account_id, body, reply_to_id, created_at, updated_at, extras)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          reply.id,
          reply.threadId,
          reply.accountId,
          reply.body,
          reply.replyToId,
          now,
          now,
          {},
        ],
      );
    }
  }

  console.log(`Seeded ${seedData.replies.length} replies`);
}

async function seedVotes(config: any): Promise<void> {
  const seedData = loadSeedData();
  console.log(`Seeding ${seedData.votes.length} votes...`);

  for (const vote of seedData.votes) {
    const now = Date.now();

    if (config.dbType === "bun_sqlite") {
      config.db.run(
        `INSERT INTO votes (id, thread_id, account_id, reply_id, direction, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        vote.id,
        vote.threadId,
        vote.accountId,
        vote.replyId,
        vote.direction,
        now,
        now,
      );
    } else {
      await config.db.query(
        `INSERT INTO votes (id, thread_id, account_id, reply_id, direction, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [vote.id, vote.threadId, vote.accountId, vote.replyId, vote.direction, now, now],
      );
    }
  }

  console.log(`Seeded ${seedData.votes.length} votes`);
}

export const seedCommand: Command = {
  name: "seed",
  description: "Seed database with data from seed.json",
  handler: async (config) => {
    await seedAccounts(config);
    await seedThreads(config);
    await seedReplies(config);
    await seedVotes(config);
    console.log(
      "Database seeded successfully with 3 accounts, 2 threads, 8 replies, and 10 votes",
    );
  },
};
