import { describe, test, expect } from "bun:test";
import { generateAccount, generateThread, generateReply, generateVote } from "../utils/seed-data.ts";

describe("Seed Data Generators", () => {
  test("generateAccount should create valid account data", () => {
    const account = generateAccount(1);
    
    expect(account.id).toBe("account_1");
    expect(account.upstreamId).toBe("upstream_1");
    expect(account.username).toBe("user1");
    expect(account.email).toBe("user1@example.com");
    expect(account.banned).toBe(false);
    expect(account.badge).toBeNull();
    expect(account.extras).toEqual({});
  });
  
  test("generateThread should create valid thread data", () => {
    const thread = generateThread(1, "account_1");
    
    expect(thread.id).toBe("thread_1");
    expect(thread.accountId).toBe("account_1");
    expect(thread.upstreamId).toBe("upstream_thread_1");
    expect(thread.title).toBe("Thread 1");
    expect(thread.body).toContain("thread 1");
    expect(thread.allowReplies).toBe(true);
    expect(thread.extras).toEqual({});
  });
  
  test("generateReply should create valid reply data", () => {
    const reply = generateReply(1, "thread_1", "account_1");
    
    expect(reply.id).toBe("reply_1");
    expect(reply.threadId).toBe("thread_1");
    expect(reply.accountId).toBe("account_1");
    expect(reply.body).toContain("reply 1");
    expect(reply.replyToId).toBe("thread_1");
    expect(reply.extras).toEqual({});
  });
  
  test("generateReply should support custom replyToId", () => {
    const reply = generateReply(1, "thread_1", "account_1", "reply_0");
    
    expect(reply.replyToId).toBe("reply_0");
  });
  
  test("generateVote should create valid vote data", () => {
    const vote = generateVote(1, "thread_1", "account_1");
    
    expect(vote.id).toBe("vote_1");
    expect(vote.threadId).toBe("thread_1");
    expect(vote.accountId).toBe("account_1");
    expect(vote.replyId).toBe("thread_1");
  });
  
  test("generateVote should support custom replyId", () => {
    const vote = generateVote(1, "thread_1", "account_1", "reply_5");
    
    expect(vote.replyId).toBe("reply_5");
  });
});
