import { describe, test, expect, beforeEach } from "bun:test";

export function flowCoverage(setup) {
  // anythreads instance
  let anythreads;

  beforeEach(() => {
    anythreads = setup.instance;
  });

  describe("get-thread-complete", () => {
    test("should return complete thread with nested replies and votes", async () => {
      const accountOne = await anythreads.accounts.create({
        username: "user1",
      });

      const secondAccount = await anythreads.accounts.create({
        username: "user2",
      });

      const thread = await anythreads.threads.create({
        accountId: accountOne.data.id,
        title: "Thread",
        body: "Body",
      });

      const reply1 = await anythreads.replies.create({
        threadId: thread.data.id,
        accountId: secondAccount.data.id,
        body: "Top level reply",
      });

      await anythreads.votes.voteUp({
        threadId: thread.data.id,
        replyId: reply1.data.id,
        accountId: accountOne.data.id,
      });

      const reply2 = await anythreads.replies.create({
        threadId: thread.data.id,
        accountId: accountOne.data.id,
        body: "Nested reply",
        replyToId: reply1.data.id,
      });

      await anythreads.votes.voteDown({
        threadId: thread.data.id,
        replyId: reply2.data.id,
        accountId: secondAccount.data.id,
      });

      const complete = await anythreads.threads.complete(thread.data.id);

      expect(complete.isOk).toBe(true);
      expect(complete.data?.thread).toBeDefined();
      expect(complete.data?.thread.id).toBe(thread.data.id);
      expect(complete.data?.thread.account).toBeDefined();
      expect(complete.data?.thread.account.username).toBe("user1");
      expect(complete.data?.thread.voteCount).toBeDefined();
      expect(complete.data?.thread.voteCount.upvotes).toBe(0);
      expect(complete.data?.thread.voteCount.downvotes).toBe(0);
      expect(complete.data?.thread.voteCount.total).toBe(0);

      expect(complete.data?.replies).toBeDefined();
      expect(complete.data?.replies.length).toBeGreaterThan(0);

      const topReply = complete.data?.replies.find((r) => r.id === reply1.data.id);
      expect(topReply).toBeDefined();
      expect(topReply?.body).toBe("Top level reply");
      expect(topReply?.account).toBeDefined();
      expect(topReply?.account.username).toBe("user2");
      expect(topReply?.voteCount).toBeDefined();
      expect(topReply?.voteCount.upvotes).toBe(1);
      expect(topReply?.voteCount.downvotes).toBe(0);
      expect(topReply?.replies).toBeDefined();
      expect(topReply?.replies.length).toBe(1);

      const nestedReply = topReply?.replies[0];
      expect(nestedReply).toBeDefined();
      expect(nestedReply?.body).toBe("Nested reply");
      expect(nestedReply?.account).toBeDefined();
      expect(nestedReply?.account.username).toBe("user1");
      expect(nestedReply?.voteCount).toBeDefined();
      expect(nestedReply?.voteCount.upvotes).toBe(0);
      expect(nestedReply?.voteCount.downvotes).toBe(1);
      expect(nestedReply?.voteCount.total).toBe(-1);
      expect(nestedReply?.replies).toBeDefined();
      expect(nestedReply?.replies.length).toBe(0);
    });
  });
}
