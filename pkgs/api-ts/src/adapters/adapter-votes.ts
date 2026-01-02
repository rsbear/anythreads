import type { ReadContext, WriteContext } from "../common/context.ts";
import type { Msg } from "../common/msg.ts";

export interface VotesDataAdapter {
	// Write operations - support cache context (votes don't need moderation)
	create(
		opts: {
			accountId: string;
			threadId: string;
			replyId?: string | null;
			direction: "up" | "down";
		},
		ctx?: WriteContext,
	): Promise<Msg<Vote>>;
	update(
		voteId: string,
		direction: "up" | "down",
		ctx?: WriteContext,
	): Promise<Msg<Vote>>;
	delete(id: string, ctx?: WriteContext): Promise<Msg<"ok">>;

	// Read operations - support cache context only
	findOne(id: string, ctx?: ReadContext): Promise<Msg<Vote>>;
	findMany(
		opts?: VotesFindManyOptions,
		ctx?: ReadContext,
	): Promise<Msg<Vote[]>>;
}

export type Vote = {
	id: string;
	threadId: string | null;
	accountId: string;
	replyId: string | null;
	direction: "up" | "down";
	createdAt: Date;
	updatedAt: Date;
};

export type VotesFindManyOptions = {
	where?: {
		accountId?: string;
		threadId?: string;
		replyId?: string | null;
		direction?: "up" | "down";
	};
	order?: {
		createdAt?: "asc" | "desc";
		updatedAt?: "asc" | "desc";
	};
	limit?: number;
	offset?: number;
};
