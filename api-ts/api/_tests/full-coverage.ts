// TODO: Missing test coverage to be added in the future:
// - CLI commands (setup, seed, empty, drop)
// - Max reply depth enforcement
// - Banned account behavior when posting/voting
// - Upstream ID edge cases
// - Extras JSON serialization edge cases
// - Thread.complete with deep nested replies
// - Vote count aggregation edge cases

import { beforeEach, describe, expect, test } from "bun:test";
import type { AnythreadsCLI } from "../cli.ts";
import type { Anythreads } from "../index";

export function fullCoverageTest(setup: AnythreadsCLI) {
  let anythreads: Anythreads;

  beforeEach(() => {
    anythreads = setup.instance;
  });

  describe("accounts", () => {
    describe("create", () => {
      test("should create account with all fields", async () => {
        const result = await anythreads.accounts.create({
          username: "testuser",
          email: "test@example.com",
          badge: "admin",
          upstreamId: "upstream-123",
          extras: { role: "moderator" },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.username).toBe("testuser");
        expect(result.data?.email).toBe("test@example.com");
        expect(result.data?.badge).toBe("admin");
        expect(result.data?.upstreamId).toBe("upstream-123");
        expect(result.data?.extras).toEqual({ role: "moderator" });
        expect(result.data?.banned).toBe(false);
        expect(result.data?.bannedAt).toBeNull();
        expect(result.data?.deletedAt).toBeNull();
      });

      test("should create account with minimal fields", async () => {
        const result = await anythreads.accounts.create({
          username: "minimal",
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.username).toBe("minimal");
        expect(result.data?.email).toBeNull();
        expect(result.data?.badge).toBeNull();
        expect(result.data?.upstreamId).toBeDefined();
        expect(result.data?.extras).toEqual({});
      });
    });

    describe("findOne", () => {
      test("should find existing account", async () => {
        const created = await anythreads.accounts.create({
          username: "findme",
        });

        const found = await anythreads.accounts.findOne(created.data!.id);

        expect(found.isOk).toBe(true);
        expect(found.data?.id).toBe(created.data?.id);
        expect(found.data?.username).toBe("findme");
      });

      test("should return error for non-existent account", async () => {
        const result = await anythreads.accounts.findOne("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Account not found");
      });
    });

    describe("findMany", () => {
      test("should find multiple accounts", async () => {
        await anythreads.accounts.create({ username: "user1" });
        await anythreads.accounts.create({ username: "user2" });
        await anythreads.accounts.create({ username: "user3" });

        const result = await anythreads.accounts.findMany({});

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(3);
      });

      test("should respect limit parameter", async () => {
        await anythreads.accounts.create({ username: "user1" });
        await anythreads.accounts.create({ username: "user2" });
        await anythreads.accounts.create({ username: "user3" });

        const result = await anythreads.accounts.findMany({ limit: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(2);
      });

      test("should respect offset parameter", async () => {
        await anythreads.accounts.create({ username: "user1" });
        await anythreads.accounts.create({ username: "user2" });
        await anythreads.accounts.create({ username: "user3" });

        const result = await anythreads.accounts.findMany({ offset: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
      });
    });

    describe("update", () => {
      test("should update username", async () => {
        const created = await anythreads.accounts.create({
          username: "oldname",
        });

        const updated = await anythreads.accounts.update(created.data!.id, {
          username: "newname",
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.username).toBe("newname");
      });

      test("should update email", async () => {
        const created = await anythreads.accounts.create({
          username: "user",
        });

        const updated = await anythreads.accounts.update(created.data!.id, {
          email: "new@example.com",
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.email).toBe("new@example.com");
      });

      test("should update badge", async () => {
        const created = await anythreads.accounts.create({
          username: "user",
        });

        const updated = await anythreads.accounts.update(created.data!.id, {
          badge: "vip",
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.badge).toBe("vip");
      });

      test("should update extras", async () => {
        const created = await anythreads.accounts.create({
          username: "user",
          extras: { old: "data" },
        });

        const updated = await anythreads.accounts.update(created.data!.id, {
          extras: { new: "data" },
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.extras).toEqual({ new: "data" });
      });

      test("should return error for non-existent account", async () => {
        const result = await anythreads.accounts.update("non-existent-id", {
          username: "newname",
        });

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Account not found");
      });
    });

    describe("ban", () => {
      test("should ban account permanently", async () => {
        const created = await anythreads.accounts.create({
          username: "baduser",
        });

        const banned = await anythreads.accounts.ban(created.data!.id, null);

        expect(banned.isOk).toBe(true);
        expect(banned.data?.banned).toBe(true);
        expect(banned.data?.bannedAt).not.toBeNull();
      });

      test("should ban account with expiration", async () => {
        const created = await anythreads.accounts.create({
          username: "baduser",
        });

        const until = new Date(Date.now() + 86400000);
        const banned = await anythreads.accounts.ban(created.data!.id, until);

        expect(banned.isOk).toBe(true);
        expect(banned.data?.banned).toBe(true);
        expect(banned.data?.bannedAt).not.toBeNull();
      });

      test("should return error for non-existent account", async () => {
        const result = await anythreads.accounts.ban("non-existent-id", null);

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Account not found");
      });
    });

    describe("unban", () => {
      test("should unban account", async () => {
        const created = await anythreads.accounts.create({
          username: "baduser",
        });

        await anythreads.accounts.ban(created.data!.id, null);
        const unbanned = await anythreads.accounts.unban(created.data!.id);

        expect(unbanned.isOk).toBe(true);
        expect(unbanned.data?.banned).toBe(false);
        expect(unbanned.data?.bannedAt).toBeNull();
      });

      test("should return error for non-existent account", async () => {
        const result = await anythreads.accounts.unban("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Account not found");
      });
    });

    describe("delete", () => {
      test("should mark account as deleted", async () => {
        const created = await anythreads.accounts.create({
          username: "deleteuser",
          email: "delete@example.com",
        });

        const deleted = await anythreads.accounts.delete(created.data!.id);

        expect(deleted.isOk).toBe(true);
        expect(deleted.data?.deletedAt).not.toBeNull();
        expect(deleted.data?.username).toContain("random-");
        expect(deleted.data?.email).toBeNull();
      });

      test("should return error for non-existent account", async () => {
        const result = await anythreads.accounts.delete("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Account not found");
      });
    });
  });

  describe("threads", () => {
    describe("create", () => {
      test("should create thread with all fields", async () => {
        const account = await anythreads.accounts.create({ username: "author" });

        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Test Thread",
          body: "This is a test thread",
          upstreamId: "upstream-123",
          allowReplies: true,
          extras: { category: "tech" },
        });

        expect(thread.isOk).toBe(true);
        expect(thread.data?.title).toBe("Test Thread");
        expect(thread.data?.body).toBe("This is a test thread");
        expect(thread.data?.accountId).toBe(account.data!.id);
        expect(thread.data?.upstreamId).toBe("upstream-123");
        expect(thread.data?.allowReplies).toBe(true);
        expect(thread.data?.extras).toEqual({ category: "tech" });
        expect(thread.data?.deletedAt).toBeNull();
      });

      test("should create thread with minimal fields", async () => {
        const account = await anythreads.accounts.create({ username: "author" });

        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Minimal Thread",
          body: "Minimal body",
        });

        expect(thread.isOk).toBe(true);
        expect(thread.data?.title).toBe("Minimal Thread");
        expect(thread.data?.allowReplies).toBe(true);
        expect(thread.data?.upstreamId).toBeDefined();
        expect(thread.data?.extras).toEqual({});
      });
    });

    describe("findOne", () => {
      test("should find existing thread", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const created = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Find Me",
          body: "Test body",
        });

        const found = await anythreads.threads.findOne(created.data!.id);

        expect(found.isOk).toBe(true);
        expect(found.data?.id).toBe(created.data?.id);
        expect(found.data?.title).toBe("Find Me");
      });

      test("should return error for non-existent thread", async () => {
        const result = await anythreads.threads.findOne("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Thread not found");
      });
    });

    describe("findMany", () => {
      test("should find multiple threads", async () => {
        const account = await anythreads.accounts.create({ username: "author" });

        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 1",
          body: "Body 1",
        });
        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 2",
          body: "Body 2",
        });
        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 3",
          body: "Body 3",
        });

        const result = await anythreads.threads.findMany({});

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(3);
      });

      test("should filter by accountId", async () => {
        const account1 = await anythreads.accounts.create({ username: "author1" });
        const account2 = await anythreads.accounts.create({ username: "author2" });

        await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread 1",
          body: "Body 1",
        });
        await anythreads.threads.create({
          accountId: account2.data!.id,
          title: "Thread 2",
          body: "Body 2",
        });

        const result = await anythreads.threads.findMany({
          where: { accountId: account1.data!.id },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.accountId).toBe(account1.data!.id);
      });

      test("should respect limit parameter", async () => {
        const account = await anythreads.accounts.create({ username: "author" });

        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 1",
          body: "Body 1",
        });
        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 2",
          body: "Body 2",
        });
        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 3",
          body: "Body 3",
        });

        const result = await anythreads.threads.findMany({ limit: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(2);
      });

      test("should respect offset parameter", async () => {
        const account = await anythreads.accounts.create({ username: "author" });

        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 1",
          body: "Body 1",
        });
        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 2",
          body: "Body 2",
        });
        await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 3",
          body: "Body 3",
        });

        const result = await anythreads.threads.findMany({ offset: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
      });
    });

    describe("update", () => {
      test("should update title", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const created = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Old Title",
          body: "Body",
        });

        const updated = await anythreads.threads.update(created.data!.id, {
          title: "New Title",
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.title).toBe("New Title");
      });

      test("should update body", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const created = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Title",
          body: "Old Body",
        });

        const updated = await anythreads.threads.update(created.data!.id, {
          body: "New Body",
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.body).toBe("New Body");
      });

      test("should update allowReplies", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const created = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Title",
          body: "Body",
          allowReplies: true,
        });

        const updated = await anythreads.threads.update(created.data!.id, {
          allowReplies: false,
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.allowReplies).toBe(false);
      });

      test("should update extras", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const created = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Title",
          body: "Body",
          extras: { old: "data" },
        });

        const updated = await anythreads.threads.update(created.data!.id, {
          extras: { new: "data" },
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.extras).toEqual({ new: "data" });
      });

      test("should return error for non-existent thread", async () => {
        const result = await anythreads.threads.update("non-existent-id", {
          title: "New Title",
        });

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Thread not found");
      });
    });

    describe("delete", () => {
      test("should mark thread as deleted", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const created = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Delete Me",
          body: "Body",
        });

        const result = await anythreads.threads.delete(created.data!.id);

        expect(result.isOk).toBe(true);
        expect(result.data).toBe("ok");

        const found = await anythreads.threads.findOne(created.data!.id);
        expect(found.data?.deletedAt).not.toBeNull();
      });

      test("should return error for non-existent thread", async () => {
        const result = await anythreads.threads.delete("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Thread not found");
      });
    });

    describe("complete", () => {
      test("should return complete thread with account and votes", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Complete Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({ threadId: thread.data!.id, accountId: account.data!.id });

        const complete = await anythreads.threads.complete(thread.data!.id);

        expect(complete.isOk).toBe(true);
        expect(complete.data?.thread.id).toBe(thread.data!.id);
        expect(complete.data?.thread.account.username).toBe("author");
        expect(complete.data?.thread.voteCount.upvotes).toBe(1);
        expect(complete.data?.thread.voteCount.downvotes).toBe(0);
        expect(complete.data?.thread.voteCount.total).toBe(1);
        expect(complete.data?.replies).toEqual([]);
      });

      test("should return thread with nested replies", async () => {
        const account = await anythreads.accounts.create({ username: "author" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread with Replies",
          body: "Body",
        });

        const reply1 = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "First reply",
        });

        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply to reply",
          replyToId: reply1.data!.id,
        });

        const complete = await anythreads.threads.complete(thread.data!.id);

        expect(complete.isOk).toBe(true);
        expect(complete.data?.replies.length).toBe(1);
        expect(complete.data?.replies[0]?.body).toBe("First reply");
        expect(complete.data?.replies[0]?.replies.length).toBe(1);
        expect(complete.data?.replies[0]?.replies[0]?.body).toBe("Reply to reply");
      });

      test("should mask deleted account information", async () => {
        const account = await anythreads.accounts.create({
          username: "author",
          email: "test@example.com",
        });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread by deleted user",
          body: "Body",
        });

        await anythreads.accounts.delete(account.data!.id);

        const complete = await anythreads.threads.complete(thread.data!.id);

        expect(complete.isOk).toBe(true);
        expect(complete.data?.thread.account.username).toBe("[deleted]");
        expect(complete.data?.thread.account.email).toBeNull();
        expect(complete.data?.thread.account.badge).toBeNull();
        expect(complete.data?.thread.account.extras).toEqual({});
      });

      test("should return error for non-existent thread", async () => {
        const result = await anythreads.threads.complete("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Thread not found");
      });
    });
  });

  describe("replies", () => {
    describe("create", () => {
      test("should create top-level reply", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        const reply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "This is a reply",
          extras: { edited: false },
        });

        expect(reply.isOk).toBe(true);
        expect(reply.data?.body).toBe("This is a reply");
        expect(reply.data?.threadId).toBe(thread.data!.id);
        expect(reply.data?.accountId).toBe(account.data!.id);
        expect(reply.data?.replyToId).toBeNull();
        expect(reply.data?.extras).toEqual({ edited: false });
        expect(reply.data?.deletedAt).toBeNull();
      });

      test("should create nested reply", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const parentReply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Parent reply",
        });

        const childReply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Child reply",
          replyToId: parentReply.data!.id,
        });

        expect(childReply.isOk).toBe(true);
        expect(childReply.data?.body).toBe("Child reply");
        expect(childReply.data?.replyToId).toBe(parentReply.data!.id);
      });
    });

    describe("findOne", () => {
      test("should find existing reply", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const created = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Find me",
        });

        const found = await anythreads.replies.findOne(created.data!.id);

        expect(found.isOk).toBe(true);
        expect(found.data?.id).toBe(created.data?.id);
        expect(found.data?.body).toBe("Find me");
      });

      test("should return error for non-existent reply", async () => {
        const result = await anythreads.replies.findOne("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Reply not found");
      });
    });

    describe("findMany", () => {
      test("should find multiple replies", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 1",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 2",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 3",
        });

        const result = await anythreads.replies.findMany({});

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(3);
      });

      test("should filter by threadId", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread1 = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 1",
          body: "Body 1",
        });
        const thread2 = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 2",
          body: "Body 2",
        });

        await anythreads.replies.create({
          threadId: thread1.data!.id,
          accountId: account.data!.id,
          body: "Reply to thread 1",
        });
        await anythreads.replies.create({
          threadId: thread2.data!.id,
          accountId: account.data!.id,
          body: "Reply to thread 2",
        });

        const result = await anythreads.replies.findMany({
          where: { threadId: thread1.data!.id },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.threadId).toBe(thread1.data!.id);
      });

      test("should filter by accountId", async () => {
        const account1 = await anythreads.accounts.create({ username: "user1" });
        const account2 = await anythreads.accounts.create({ username: "user2" });
        const thread = await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account1.data!.id,
          body: "Reply by user 1",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account2.data!.id,
          body: "Reply by user 2",
        });

        const result = await anythreads.replies.findMany({
          where: { accountId: account2.data!.id },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.accountId).toBe(account2.data!.id);
      });

      test("should filter by replyToId null", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const parentReply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Parent",
        });

        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Child",
          replyToId: parentReply.data!.id,
        });

        const result = await anythreads.replies.findMany({
          where: { replyToId: null },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.replyToId).toBeNull();
      });

      test("should respect limit parameter", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 1",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 2",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 3",
        });

        const result = await anythreads.replies.findMany({ limit: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(2);
      });

      test("should respect offset parameter", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 1",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 2",
        });
        await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply 3",
        });

        const result = await anythreads.replies.findMany({ offset: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
      });
    });

    describe("update", () => {
      test("should update body", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const created = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Old body",
        });

        const updated = await anythreads.replies.update(created.data!.id, {
          body: "New body",
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.body).toBe("New body");
      });

      test("should update extras", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const created = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Body",
          extras: { old: "data" },
        });

        const updated = await anythreads.replies.update(created.data!.id, {
          extras: { new: "data" },
        });

        expect(updated.isOk).toBe(true);
        expect(updated.data?.extras).toEqual({ new: "data" });
      });

      test("should return error for non-existent reply", async () => {
        const result = await anythreads.replies.update("non-existent-id", {
          body: "New body",
        });

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Reply not found");
      });
    });

    describe("delete", () => {
      test("should mark reply as deleted", async () => {
        const account = await anythreads.accounts.create({ username: "user" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const created = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Delete me",
        });

        const result = await anythreads.replies.delete(created.data!.id);

        expect(result.isOk).toBe(true);
        expect(result.data).toBe("ok");

        const found = await anythreads.replies.findOne(created.data!.id);
        expect(found.data?.deletedAt).not.toBeNull();
      });

      test("should return error for non-existent reply", async () => {
        const result = await anythreads.replies.delete("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Reply not found");
      });
    });
  });

  describe("votes", () => {
    describe("voteUpThread", () => {
      test("should create upvote on thread", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        const vote = await anythreads.votes.voteUpThread(account.data!.id, thread.data!.id);

        expect(vote.isOk).toBe(true);
        expect(vote.data?.direction).toBe("up");
        expect(vote.data?.threadId).toBe(thread.data!.id);
        expect(vote.data?.accountId).toBe(account.data!.id);
        expect(vote.data?.replyId).toBeNull();
      });

      test("should update existing downvote to upvote", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteDownThread(account.data!.id, thread.data!.id);

        const vote = await anythreads.votes.voteUpThread(account.data!.id, thread.data!.id);

        expect(vote.isOk).toBe(true);
        expect(vote.data?.direction).toBe("up");
      });
    });

    describe("voteUpReply", () => {
      test("should create upvote on reply", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const reply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply",
        });

        const vote = await anythreads.votes.voteUpReply(
          account.data!.id,
          thread.data!.id,
          reply.data!.id,
        );

        expect(vote.isOk).toBe(true);
        expect(vote.data?.direction).toBe("up");
        expect(vote.data?.replyId).toBe(reply.data!.id);
        expect(vote.data?.threadId).toBe(thread.data!.id);
      });
    });

    describe("voteDown", () => {
      test("should create downvote on thread", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        const vote = await anythreads.votes.voteDown({
          threadId: thread.data!.id,
          accountId: account.data!.id,
        });

        expect(vote.isOk).toBe(true);
        expect(vote.data?.direction).toBe("down");
        expect(vote.data?.threadId).toBe(thread.data!.id);
      });

      test("should create downvote on reply", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const reply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply",
        });

        const vote = await anythreads.votes.voteDown({
          replyId: reply.data!.id,
          accountId: account.data!.id,
        });

        expect(vote.isOk).toBe(true);
        expect(vote.data?.direction).toBe("down");
        expect(vote.data?.replyId).toBe(reply.data!.id);
      });

      test("should update existing upvote to downvote", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account.data!.id,
        });

        const vote = await anythreads.votes.voteDown({
          threadId: thread.data!.id,
          accountId: account.data!.id,
        });

        expect(vote.isOk).toBe(true);
        expect(vote.data?.direction).toBe("down");
      });
    });

    describe("findOne", () => {
      test("should find existing vote", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const created = await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account.data!.id,
        });

        const found = await anythreads.votes.findOne(created.data!.id);

        expect(found.isOk).toBe(true);
        expect(found.data?.id).toBe(created.data?.id);
        expect(found.data?.direction).toBe("up");
      });

      test("should return error for non-existent vote", async () => {
        const result = await anythreads.votes.findOne("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Vote not found");
      });
    });

    describe("findMany", () => {
      test("should find multiple votes", async () => {
        const account1 = await anythreads.accounts.create({ username: "voter1" });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        const thread = await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account1.data!.id,
        });
        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account2.data!.id,
        });

        const result = await anythreads.votes.findMany({});

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(2);
      });

      test("should filter by threadId", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread1 = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 1",
          body: "Body 1",
        });
        const thread2 = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread 2",
          body: "Body 2",
        });

        await anythreads.votes.voteUp({
          threadId: thread1.data!.id,
          accountId: account.data!.id,
        });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        await anythreads.votes.voteUp({
          threadId: thread2.data!.id,
          accountId: account2.data!.id,
        });

        const result = await anythreads.votes.findMany({
          where: { threadId: thread1.data!.id },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.threadId).toBe(thread1.data!.id);
      });

      test("should filter by accountId", async () => {
        const account1 = await anythreads.accounts.create({ username: "voter1" });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        const thread = await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account1.data!.id,
        });
        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account2.data!.id,
        });

        const result = await anythreads.votes.findMany({
          where: { accountId: account2.data!.id },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.accountId).toBe(account2.data!.id);
      });

      test("should filter by direction", async () => {
        const account1 = await anythreads.accounts.create({ username: "voter1" });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        const thread = await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account1.data!.id,
        });
        await anythreads.votes.voteDown({
          threadId: thread.data!.id,
          accountId: account2.data!.id,
        });

        const result = await anythreads.votes.findMany({
          where: { direction: "up" },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.direction).toBe("up");
      });

      test("should filter by replyId null", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const reply = await anythreads.replies.create({
          threadId: thread.data!.id,
          accountId: account.data!.id,
          body: "Reply",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account.data!.id,
        });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        await anythreads.votes.voteUp({
          replyId: reply.data!.id,
          accountId: account2.data!.id,
        });

        const result = await anythreads.votes.findMany({
          where: { replyId: null },
        });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0]?.replyId).toBeNull();
      });

      test("should respect limit parameter", async () => {
        const account1 = await anythreads.accounts.create({ username: "voter1" });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        const account3 = await anythreads.accounts.create({ username: "voter3" });
        const thread = await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account1.data!.id,
        });
        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account2.data!.id,
        });
        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account3.data!.id,
        });

        const result = await anythreads.votes.findMany({ limit: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(2);
      });

      test("should respect offset parameter", async () => {
        const account1 = await anythreads.accounts.create({ username: "voter1" });
        const account2 = await anythreads.accounts.create({ username: "voter2" });
        const account3 = await anythreads.accounts.create({ username: "voter3" });
        const thread = await anythreads.threads.create({
          accountId: account1.data!.id,
          title: "Thread",
          body: "Body",
        });

        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account1.data!.id,
        });
        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account2.data!.id,
        });
        await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account3.data!.id,
        });

        const result = await anythreads.votes.findMany({ offset: 2 });

        expect(result.isOk).toBe(true);
        expect(result.data?.length).toBe(1);
      });
    });

    describe("delete", () => {
      test("should delete vote", async () => {
        const account = await anythreads.accounts.create({ username: "voter" });
        const thread = await anythreads.threads.create({
          accountId: account.data!.id,
          title: "Thread",
          body: "Body",
        });
        const created = await anythreads.votes.voteUp({
          threadId: thread.data!.id,
          accountId: account.data!.id,
        });

        const result = await anythreads.votes.delete(created.data!.id);

        expect(result.isOk).toBe(true);
        expect(result.data).toBe("ok");

        const found = await anythreads.votes.findOne(created.data!.id);
        expect(found.isOk).toBe(false);
      });

      test("should return error for non-existent vote", async () => {
        const result = await anythreads.votes.delete("non-existent-id");

        expect(result.isOk).toBe(false);
        expect(result.err?.msg).toBe("Vote not found");
      });
    });
  });
}
