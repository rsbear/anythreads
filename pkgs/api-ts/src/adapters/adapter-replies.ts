import type { ReadContext, WriteContext } from "../common/context.ts";
import type { Msg } from "../common/msg.ts";

export interface RepliesDataAdapter {
	// Write operations - support moderation + cache context
	create(reply: ReplyCreate, ctx?: WriteContext): Promise<Msg<Reply>>;
	update(
		id: string,
		reply: ReplyUpdate,
		ctx?: WriteContext,
	): Promise<Msg<Reply>>;
	delete(id: string, ctx?: WriteContext): Promise<Msg<"ok">>;

	// Read operations - support cache context only
	findOne(id: string, ctx?: ReadContext): Promise<Msg<Reply>>;
	findMany(
		opts?: RepliesFindManyOptions,
		ctx?: ReadContext,
	): Promise<Msg<Reply[]>>;
}

export type Reply = {
	id: string;
	threadId: string;
	accountId: string;
	body: string;
	replyToId: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	extras: Record<string, any>;
};

export type RepliesFindManyOptions = {
	where?: {
		accountId?: string;
		upstreamId?: string;
		threadId?: string;
		replyToId?: string | null;
	};
	order?: {
		createdAt?: "asc" | "desc";
		updatedAt?: "asc" | "desc";
	};
	limit?: number;
	offset?: number;
};

export type ReplyCreate = {
	threadId: string;
	accountId: string;
	body: string;
	replyToId?: string;
	extras?: Record<string, any>;
};

export type ReplyUpdate = {
	body?: string;
	extras?: Record<string, any>;
};
