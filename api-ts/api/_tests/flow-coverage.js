import { beforeEach, describe, expect, test } from "bun:test";

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

      if (!accountOne.isOk) {
        throw new Error("Failed to create account");
      }

      const secondAccount = await anythreads.accounts.create({
        username: "user2",
      });

      if (!secondAccount.isOk) {
        throw new Error("Failed to create account");
      }

      const thread = await anythreads.threads.create({
        accountId: accountOne.value.id,
        title: "Thread",
        body: "Body",
      });

      const reply1 = await anythreads.replies.create({
        threadId: thread.value.id,
        accountId: secondAccount.value.id,
        body: "Top level reply",
      });

      await anythreads.votes.voteUpReply(accountOne.value.id, thread.value.id, reply1.value.id);

      const reply2 = await anythreads.replies.create({
        threadId: thread.value.id,
        accountId: accountOne.value.id,
        body: "Nested reply",
        replyToId: reply1.value.id,
      });

      await anythreads.votes.voteDownReply(
        secondAccount.value.id,
        thread.value.id,
        reply2.value.id,
      );

      const complete = await anythreads.threads.complete(thread.value.id);

      expect(complete.isOk).toBe(true);
      expect(complete.value?.thread).toBeDefined();
      expect(complete.value?.thread.id).toBe(thread.value.id);
      expect(complete.value?.thread.account).toBeDefined();
      expect(complete.value?.thread.account.username).toBe("user1");
      expect(complete.value?.thread.voteCount).toBeDefined();
      expect(complete.value?.thread.voteCount.upvotes).toBe(0);
      expect(complete.value?.thread.voteCount.downvotes).toBe(0);
      expect(complete.value?.thread.voteCount.total).toBe(0);

      expect(complete.value?.replies).toBeDefined();
      expect(complete.value?.replies.length).toBeGreaterThan(0);

      const topReply = complete.value?.replies.find((r) => r.id === reply1.value.id);
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

    test("should handle thread votes correctly", async () => {
      const account = await anythreads.accounts.create({
        username: "voter",
      });

      if (!account.isOk) {
        throw new Error("Failed to create account");
      }

      const thread = await anythreads.threads.create({
        accountId: account.value.id,
        title: "Vote Test Thread",
        body: "Testing thread votes",
      });

      const upvote = await anythreads.votes.voteUpThread(account.value.id, thread.value.id);

      expect(upvote.isOk).toBe(true);
      expect(upvote.value?.direction).toBe("up");
      expect(upvote.value?.threadId).toBe(thread.value.id);
      expect(upvote.value?.replyId).toBeNull();

      const downvote = await anythreads.votes.voteDownThread(account.value.id, thread.value.id);

      expect(downvote.isOk).toBe(true);
      expect(downvote.value?.direction).toBe("down");
      expect(downvote.value?.id).toBe(upvote.value?.id);

      const complete = await anythreads.threads.complete(thread.value.id);
      expect(complete.value?.thread.voteCount.upvotes).toBe(0);
      expect(complete.value?.thread.voteCount.downvotes).toBe(1);
      expect(complete.value?.thread.voteCount.total).toBe(-1);
    });

    test("should handle reply votes with threadId requirement", async () => {
      const account = await anythreads.accounts.create({
        username: "replier",
      });

      if (!account.isOk) {
        throw new Error("Failed to create account");
      }

      const thread = await anythreads.threads.create({
        accountId: account.value.id,
        title: "Reply Vote Test",
        body: "Testing reply votes",
      });

      const reply = await anythreads.replies.create({
        threadId: thread.value.id,
        accountId: account.value.id,
        body: "A reply to vote on",
      });

      const upvote = await anythreads.votes.voteUpReply(
        account.value.id,
        thread.value.id,
        reply.value.id,
      );

      expect(upvote.isOk).toBe(true);
      expect(upvote.value?.direction).toBe("up");
      expect(upvote.value?.threadId).toBe(thread.value.id);
      expect(upvote.value?.replyId).toBe(reply.value.id);

      const complete = await anythreads.threads.complete(thread.value.id);
      const replyWithVote = complete.value?.replies.find((r) => r.id === reply.value.id);
      expect(replyWithVote?.voteCount.upvotes).toBe(1);
      expect(replyWithVote?.voteCount.downvotes).toBe(0);
      expect(replyWithVote?.voteCount.total).toBe(1);
    });

    test("should fetch user votes separately via userVotes method", async () => {
      const accountOne = await anythreads.accounts.create({
        username: "voter_one",
        email: "voter_one@example.com",
      });

      const accountTwo = await anythreads.accounts.create({
        username: "voter_two",
        email: "voter_two@example.com",
      });

      const thread = await anythreads.threads.create({
        title: "Vote Test Thread",
        body: "Testing votes",
        accountId: accountOne.value.id,
      });

      const reply1 = await anythreads.replies.create({
        threadId: thread.value.id,
        accountId: accountOne.value.id,
        body: "First reply",
      });

      const reply2 = await anythreads.replies.create({
        threadId: thread.value.id,
        accountId: accountOne.value.id,
        body: "Second reply",
      });

      await anythreads.votes.voteUpThread(accountOne.value.id, thread.value.id);
      await anythreads.votes.voteDownThread(accountTwo.value.id, thread.value.id);
      await anythreads.votes.voteUpReply(accountOne.value.id, thread.value.id, reply1.value.id);
      await anythreads.votes.voteDownReply(accountTwo.value.id, thread.value.id, reply2.value.id);

      const complete = await anythreads.threads.complete(thread.value.id, 10);
      expect(complete.isOk).toBe(true);
      expect(complete.value?.thread.voteCount.upvotes).toBe(1);
      expect(complete.value?.thread.voteCount.downvotes).toBe(1);
      expect(complete.value?.thread.voteCount.currentUserVote).toBeUndefined();

      const userVotesHash = await anythreads.threads.userVotes({
        accountId: accountOne.value.id,
        threadId: thread.value.id,
        toHash: true,
      });

      expect(userVotesHash.isOk).toBe(true);
      const votes = userVotesHash.value;
      expect(votes[`thread:${thread.value.id}`]).toBeDefined();
      expect(votes[`thread:${thread.value.id}`].direction).toBe("up");
      expect(votes[`reply:${reply1.value.id}`]).toBeDefined();
      expect(votes[`reply:${reply1.value.id}`].direction).toBe("up");
      expect(votes[`reply:${reply2.value.id}`]).toBeUndefined();

      const userVotesArray = await anythreads.threads.userVotes({
        accountId: accountOne.value.id,
        threadId: thread.value.id,
        toHash: false,
      });

      expect(userVotesArray.isOk).toBe(true);
      expect(Array.isArray(userVotesArray.value)).toBe(true);
      expect(userVotesArray.value.length).toBe(2);
    });
  });
}
