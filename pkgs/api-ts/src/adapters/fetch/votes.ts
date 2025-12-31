import type { FetchConfig } from "../../common/fetch-utils.ts";
import { fetchRequest } from "../../common/fetch-utils.ts";
import type { Msg } from "../../common/msg";
import type {
	Vote,
	VotesDataAdapter,
	VotesFindManyOptions,
} from "../adapter-votes.ts";

export class FetchVotesAdapter implements VotesDataAdapter {
	constructor(private config: FetchConfig) {}

	async create(opts: {
		accountId: string;
		threadId: string;
		replyId?: string | null;
		direction: "up" | "down";
	}): Promise<Msg<Vote>> {
		return fetchRequest<Vote>(this.config, "/votes/create", {
			method: "POST",
			body: opts,
		});
	}

	async update(voteId: string, direction: "up" | "down"): Promise<Msg<Vote>> {
		return fetchRequest<Vote>(this.config, `/votes/${voteId}/update`, {
			method: "PUT",
			body: { direction },
		});
	}

	async delete(id: string): Promise<Msg<"ok">> {
		return fetchRequest<"ok">(this.config, `/votes/${id}/delete`, {
			method: "DELETE",
		});
	}

	async findOne(id: string): Promise<Msg<Vote>> {
		return fetchRequest<Vote>(this.config, `/votes/${id}`);
	}

	async findMany(opts?: VotesFindManyOptions): Promise<Msg<Vote[]>> {
		const params: Record<string, any> = {};

		if (opts?.where?.accountId) params.accountId = opts.where.accountId;
		if (opts?.where?.threadId) params.threadId = opts.where.threadId;
		if (opts?.where?.replyId !== undefined) params.replyId = opts.where.replyId;
		if (opts?.where?.direction) params.direction = opts.where.direction;
		if (opts?.order?.createdAt) params.orderCreatedAt = opts.order.createdAt;
		if (opts?.order?.updatedAt) params.orderUpdatedAt = opts.order.updatedAt;
		if (opts?.limit) params.limit = opts.limit;
		if (opts?.offset) params.offset = opts.offset;

		return fetchRequest<Vote[]>(this.config, "/votes", { params });
	}
}
