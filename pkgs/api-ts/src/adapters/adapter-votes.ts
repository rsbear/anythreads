import type { Msg } from "../common/msg.ts";

export interface VotesDataAdapter {
	create(opts: {
		accountId: string;
		threadId: string;
		replyId?: string | null;
		direction: "up" | "down";
	}): Promise<Msg<Vote>>;
	update(voteId: string, direction: "up" | "down"): Promise<Msg<Vote>>;
	delete(id: string): Promise<Msg<"ok">>;
	findOne(id: string): Promise<Msg<Vote>>;
	findMany(opts?: VotesFindManyOptions): Promise<Msg<Vote[]>>;
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
