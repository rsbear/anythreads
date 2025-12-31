// @ts-nocheck
/**
 * Dont care type check this file, let the test results speak to correctness
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type { Anythreads } from "..";
import { isErr, isNone, isSome } from "../common/msg";

export function flowCoverage(setup) {
	// anythreads instance
	let anythreads: Anythreads;

	beforeEach(() => {
		anythreads = setup.instance;
	});

	describe("get-thread-complete", () => {
		test("should return complete thread with nested replies and votes", async () => {
			const accountOne = await anythreads.accounts.create({
				username: "user1",
			});

			if (isErr(accountOne)) {
				throw new Error("Failed to create account");
			}

			const secondAccount = await anythreads.accounts.create({
				username: "user2",
			});

			if (isErr(secondAccount)) {
				throw new Error("Failed to create account");
			}

			if (isNone(accountOne)) {
				throw new Error("Why the heck is accountOne none!?");
			}

			if (isNone(secondAccount)) {
				throw new Error("Why the heck is secondAccount none!?");
			}

			const thread = await anythreads.threads.create({
				accountId: accountOne.value.id,
				title: "Thread",
				body: "Body",
			});

			if (isErr(thread)) {
				throw new Error("Failed to create thread");
			}

			if (isNone(thread)) {
				throw new Error("Why the heck is thread none!?");
			}

			const reply1 = await anythreads.replies.create({
				threadId: thread.value.id,
				accountId: secondAccount.value.id,
				body: "Top level reply",
			});
			if (isErr(reply1)) {
				throw new Error("Failed to create reply");
			}
			if (isNone(reply1)) {
				throw new Error("Why the heck is reply1 none!?");
			}

			await anythreads.votes.create({
				accountId: accountOne.value.id,
				threadId: thread.value.id,
				replyId: reply1.value.id,
				direction: "up",
			});

			const reply2 = await anythreads.replies.create({
				threadId: thread.value.id,
				accountId: accountOne.value.id,
				body: "Nested reply",
				replyToId: reply1.value.id,
			});

			if (isErr(reply2)) {
				throw new Error("Failed to create reply");
			}
			if (isNone(reply2)) {
				throw new Error("Why the heck is reply2 none!?");
			}

			await anythreads.votes.create({
				accountId: secondAccount.value.id,
				threadId: thread.value.id,
				replyId: reply2.value.id,
				direction: "down",
			});

			const complete = await anythreads.threads.complete(thread.value.id);
			if (isErr(complete)) throw new Error("Failed to complete thread");
			if (isNone(complete)) throw new Error("Why the heck is complete none!?");

			expect(isSome(complete)).toBe(true);
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

			const topReply = complete.value?.replies.find(
				(r) => r.id === reply1.value.id,
			);
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

			if (isErr(account)) throw new Error("Failed to create account");
			if (isNone(account)) throw new Error("Why the heck is account none!?");

			const thread = await anythreads.threads.create({
				accountId: account.value.id,
				title: "Vote Test Thread",
				body: "Testing thread votes",
			});
			if (isErr(thread)) throw new Error("Failed to create thread");
			if (isNone(thread)) throw new Error("Why the heck is thread none!?");

			const upvote = await anythreads.votes.create({
				accountId: account.value.id,
				threadId: thread.value.id,
				direction: "up",
			});
			if (isErr(upvote)) throw new Error("Failed to upvote thread");
			if (isNone(upvote)) throw new Error("Why the heck is upvote none!?");

			expect(isSome(upvote)).toBe(true);
			expect(upvote.value?.direction).toBe("up");
			expect(upvote.value?.threadId).toBe(thread.value.id);
			expect(upvote.value?.replyId).toBeNull();

			const downvote = await anythreads.votes.create({
				accountId: account.value.id,
				threadId: thread.value.id,
				direction: "down",
			});
			if (isErr(downvote)) throw new Error("Failed to downvote thread");
			if (isNone(downvote)) throw new Error("Why the heck is downvote none!?");

			expect(isSome(downvote)).toBe(true);
			expect(downvote.value?.direction).toBe("down");
			expect(downvote.value?.id).toBe(upvote.value?.id);

			const complete = await anythreads.threads.complete(thread.value.id);
			if (isErr(complete)) throw new Error("Failed to complete thread");
			if (isNone(complete)) throw new Error("Why the heck is complete none!?");
			expect(complete.value?.thread.voteCount.upvotes).toBe(0);
			expect(complete.value?.thread.voteCount.downvotes).toBe(1);
			expect(complete.value?.thread.voteCount.total).toBe(-1);
		});

		test("should handle reply votes with threadId requirement", async () => {
			const account = await anythreads.accounts.create({
				username: "replier",
			});
			if (isErr(account)) throw new Error("Failed to create account");
			if (isNone(account)) throw new Error("Why the heck is account none!?");

			const thread = await anythreads.threads.create({
				accountId: account.value.id,
				title: "Reply Vote Test",
				body: "Testing reply votes",
			});
			if (isErr(thread)) throw new Error("Failed to create thread");
			if (isNone(thread)) throw new Error("Why the heck is thread none!?");

			const reply = await anythreads.replies.create({
				threadId: thread.value.id,
				accountId: account.value.id,
				body: "A reply to vote on",
			});
			if (isErr(reply)) throw new Error("Failed to create reply");
			if (isNone(reply)) throw new Error("Why the heck is reply none!?");

			const upvote = await anythreads.votes.create({
				accountId: account.value.id,
				threadId: thread.value.id,
				replyId: reply.value.id,
				direction: "up",
			});

			expect(isSome(upvote)).toBe(true);
			expect(upvote.value?.direction).toBe("up");
			expect(upvote.value?.threadId).toBe(thread.value.id);
			expect(upvote.value?.replyId).toBe(reply.value.id);

			const complete = await anythreads.threads.complete(thread.value.id);
			const replyWithVote = complete.value?.replies.find(
				(r) => r.id === reply.value.id,
			);
			expect(replyWithVote?.voteCount.upvotes).toBe(1);
			expect(replyWithVote?.voteCount.downvotes).toBe(0);
			expect(replyWithVote?.voteCount.total).toBe(1);
		});

		test("should fetch user votes separately via personalizedThread method", async () => {
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

			await anythreads.votes.create({
				accountId: accountOne.value.id,
				threadId: thread.value.id,
				direction: "up",
			});
			await anythreads.votes.create({
				accountId: accountTwo.value.id,
				threadId: thread.value.id,
				direction: "down",
			});
			await anythreads.votes.create({
				accountId: accountOne.value.id,
				threadId: thread.value.id,
				replyId: reply1.value.id,
				direction: "up",
			});
			await anythreads.votes.create({
				accountId: accountTwo.value.id,
				threadId: thread.value.id,
				replyId: reply2.value.id,
				direction: "down",
			});

			const complete = await anythreads.threads.complete(thread.value.id, 10);
			expect(isSome(complete)).toBe(true);
			expect(complete.value?.thread.voteCount.upvotes).toBe(1);
			expect(complete.value?.thread.voteCount.downvotes).toBe(1);
			expect(complete.value?.thread.voteCount.currentUserVote).toBeUndefined();

			const userVotesHash = await anythreads.accounts.personalizedThread({
				accountId: accountOne.value.id,
				threadId: thread.value.id,
			});

			expect(isSome(userVotesHash)).toBe(true);
			const votes = userVotesHash.value;
			expect(votes[`thread:${thread.value.id}`]).toBeDefined();
			expect(votes[`thread:${thread.value.id}`].direction).toBe("up");
			expect(votes[`reply:${reply1.value.id}`]).toBeDefined();
			expect(votes[`reply:${reply1.value.id}`].direction).toBe("up");
			expect(votes[`reply:${reply2.value.id}`]).toBeUndefined();
			expect(Object.keys(votes).length).toBe(2);
		});
	});
}
