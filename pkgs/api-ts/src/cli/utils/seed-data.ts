import type { Account, Reply, Thread, Vote } from "../../api/schema";

export function generateAccount(
	index: number,
): Omit<Account, "createdAt" | "updatedAt" | "deletedAt" | "bannedAt"> {
	return {
		id: `account_${index}`,
		upstreamId: `upstream_${index}`,
		username: `user${index}`,
		email: `user${index}@example.com`,
		banned: false,
		badge: null,
		extras: {},
	};
}

export function generateThread(
	index: number,
	accountId: string,
): Omit<Thread, "createdAt" | "updatedAt" | "deletedAt"> {
	return {
		id: `thread_${index}`,
		accountId,
		upstreamId: `upstream_thread_${index}`,
		title: `Thread ${index}`,
		body: `This is the body of thread ${index}`,
		allowReplies: true,
		extras: {},
	};
}

export function generateReply(
	index: number,
	threadId: string,
	accountId: string,
	replyToId?: string,
): Omit<Reply, "createdAt" | "updatedAt" | "deletedAt"> {
	return {
		id: `reply_${index}`,
		threadId,
		accountId,
		body: `This is reply ${index}`,
		replyToId: replyToId || threadId,
		extras: {},
	};
}

export function generateVote(
	index: number,
	threadId: string,
	accountId: string,
	replyId?: string,
): Omit<Vote, "createdAt" | "updatedAt"> {
	const isIndexEven = index % 2 === 0;
	return {
		id: `vote_${index}`,
		threadId,
		accountId,
		replyId: replyId || threadId,
		direction: isIndexEven ? "up" : "down",
	};
}
