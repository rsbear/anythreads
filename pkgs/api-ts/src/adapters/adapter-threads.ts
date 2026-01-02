import type { ReadContext, WriteContext } from "../common/context.ts";
import type { Msg } from "../common/msg.ts";
import type { Account } from "./adapter-accounts.ts";
import type { Reply } from "./adapter-replies.ts";

/**
 * The interface for a thread data adapter.
 * This interface defines the methods that must be implemented by a thread data adapter.
 */
export interface ThreadsDataAdapter {
	// Write operations - support moderation + cache context
	create(thread: ThreadCreate, ctx?: WriteContext): Promise<Msg<Thread>>;
	update(
		id: string,
		thread: ThreadUpdate,
		ctx?: WriteContext,
	): Promise<Msg<Thread>>;
	delete(id: string, ctx?: WriteContext): Promise<Msg<"ok">>;

	// Read operations - support cache context only
	findOne(id: string, ctx?: ReadContext): Promise<Msg<Thread>>;
	findMany(
		opts?: ThreadsFindManyOptions,
		ctx?: ReadContext,
	): Promise<Msg<Thread[]>>;
	complete(
		id: string,
		maxReplyDepth?: number,
		ctx?: ReadContext,
	): Promise<Msg<ThreadComplete>>;
}

export type Thread = {
	id: string;
	accountId: string;
	/** An external id such as product ID, Blog post ID, etc. */
	upstreamId: string | null;
	title: string;
	body: string;
	allowReplies: boolean;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	extras: Record<string, any>;
};

export type ThreadCreate = {
	title: string;
	body: string;
	accountId: string;
	upstreamId?: string;
	allowReplies?: boolean;
	extras?: Record<string, any>;
};

export interface ThreadUpdate {
	title?: string;
	body?: string;
	allowReplies?: boolean;
	extras?: Record<string, any>;
}

export type ThreadsFindManyOptions = {
	where?: {
		accountId?: string;
		upstreamId?: string;
	};
	order?: {
		createdAt?: "asc" | "desc";
		updatedAt?: "asc" | "desc";
	};
	limit?: number;
	offset?: number;
};

// ----- Thread as full tree with replies, accounts, votes

export type VoteCount = {
	upvotes: number;
	downvotes: number;
	total: number;
};

export type UserVote = {
	threadId: string;
	replyId: string | null;
	accountId: string;
	direction: "up" | "down" | "none";
};

export type ReplyWithNested = Reply & {
	account: Account;
	voteCount: VoteCount;
	replies: ReplyWithNested[];
};

export type ThreadWithDetails = Thread & {
	account: Account;
	voteCount: VoteCount;
};

export interface ThreadComplete {
	thread: ThreadWithDetails;
	replies: ReplyWithNested[];
}
