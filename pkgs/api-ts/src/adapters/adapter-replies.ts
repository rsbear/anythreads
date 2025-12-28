import type { Msg } from "../common/msg.ts";

export interface RepliesDataAdapter {
	create(reply: ReplyCreate): Promise<Msg<Reply>>;
	delete(id: string): Promise<Msg<"ok">>;
	findOne(id: string): Promise<Msg<Reply>>;
	findMany(opts?: RepliesFindManyOptions): Promise<Msg<Reply[]>>;
	update(id: string, reply: ReplyUpdate): Promise<Msg<Reply>>;
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
