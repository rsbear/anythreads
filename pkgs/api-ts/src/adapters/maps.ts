import type { Account } from "./adapter-accounts.ts";
import type { Reply } from "./adapter-replies.ts";
import type { ReplyWithNested, Thread, VoteCount } from "./adapter-threads.ts";
import type { Vote } from "./adapter-votes.ts";

export function mapDbToThread(row: any): Thread {
	return {
		id: row.id,
		accountId: row.account_id,
		upstreamId: row.upstream_id,
		title: row.title,
		body: row.body,
		allowReplies: row.allow_replies === 1 || row.allow_replies === true,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at),
		deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
		extras:
			typeof row.extras === "string"
				? JSON.parse(row.extras)
				: row.extras || {},
	};
}

export function mapDbToAccount(row: any): Account {
	return {
		id: row.id,
		upstreamId: row.upstream_id,
		username: row.username,
		email: row.email,
		badge: row.badge,
		banned: row.banned === 1 || row.banned === true,
		bannedAt: row.banned_at ? new Date(row.banned_at) : null,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at),
		deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
		extras:
			typeof row.extras === "string"
				? JSON.parse(row.extras)
				: row.extras || {},
	};
}

export function mapDbToReply(row: any): Reply {
	return {
		id: row.id,
		threadId: row.thread_id,
		accountId: row.account_id,
		body: row.body,
		replyToId: row.reply_to_id,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at),
		deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
		extras:
			typeof row.extras === "string"
				? JSON.parse(row.extras)
				: row.extras || {},
	};
}

export function maskDeletedAccount(account: Account): Account {
	if (account.deletedAt) {
		return {
			...account,
			username: "[deleted]",
			email: null,
			badge: null,
			extras: {},
		};
	}
	return account;
}

export function mapDbToVote(row: any): Vote {
	return {
		id: row.id,
		threadId: row.thread_id,
		accountId: row.account_id,
		replyId: row.reply_id,
		direction: row.direction,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at),
	};
}

export function buildReplyTree(
	replies: Array<Reply & { account: Account; voteCount: VoteCount }>,
	parentId: string | null,
	maxDepth: number,
	currentDepth: number = 0,
): ReplyWithNested[] {
	if (currentDepth >= maxDepth) {
		return [];
	}

	const children = replies.filter((r) => r.replyToId === parentId);

	return children.map((reply) => ({
		...reply,
		account: maskDeletedAccount(reply.account),
		replies: buildReplyTree(replies, reply.id, maxDepth, currentDepth + 1),
	}));
}
