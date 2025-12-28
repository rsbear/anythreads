import type { Msg } from "../common/msg.ts";
import type { Account } from "./adapter-accounts.ts";
import type { Reply } from "./adapter-replies.ts";

/**
 * The interface for a thread data adapter.
 * This interface defines the methods that must be implemented by a thread data adapter.
 */
export interface ThreadsDataAdapter {
	create(thread: ThreadCreate): Promise<Msg<Thread>>;
	delete(id: string): Promise<Msg<"ok">>;
	findOne(id: string): Promise<Msg<Thread>>;
	findMany(opts?: ThreadsFindManyOptions): Promise<Msg<Thread[]>>;
	update(id: string, thread: ThreadUpdate): Promise<Msg<Thread>>;
	complete(id: string, maxReplyDepth?: number): Promise<Msg<ThreadComplete>>;
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
