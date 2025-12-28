import { type FetchConfig, fetchRequest } from "../../common/fetch-utils.ts";

import type { Msg } from "../../common/msg.ts";
import type {
	RepliesDataAdapter,
	RepliesFindManyOptions,
	Reply,
	ReplyCreate,
	ReplyUpdate,
} from "../adapter-replies.ts";

export class FetchRepliesAdapter implements RepliesDataAdapter {
	constructor(private config: FetchConfig) {}

	async create(reply: ReplyCreate): Promise<Msg<Reply>> {
		return fetchRequest<Reply>(this.config, "/replies", {
			method: "POST",
			body: reply,
		});
	}

	async delete(id: string): Promise<Msg<"ok">> {
		return fetchRequest<"ok">(this.config, `/replies/${id}`, {
			method: "DELETE",
		});
	}

	async findOne(id: string): Promise<Msg<Reply>> {
		return fetchRequest<Reply>(this.config, `/replies/${id}`);
	}

	async findMany(opts?: RepliesFindManyOptions): Promise<Msg<Reply[]>> {
		const params: Record<string, any> = {};

		if (opts?.where?.accountId) params.accountId = opts.where.accountId;
		if (opts?.where?.upstreamId) params.upstreamId = opts.where.upstreamId;
		if (opts?.where?.threadId) params.threadId = opts.where.threadId;
		if (opts?.where?.replyToId !== undefined)
			params.replyToId = opts.where.replyToId;
		if (opts?.order?.createdAt) params.orderCreatedAt = opts.order.createdAt;
		if (opts?.order?.updatedAt) params.orderUpdatedAt = opts.order.updatedAt;
		if (opts?.limit) params.limit = opts.limit;
		if (opts?.offset) params.offset = opts.offset;

		return fetchRequest<Reply[]>(this.config, "/replies", { params });
	}

	async update(id: string, reply: ReplyUpdate): Promise<Msg<Reply>> {
		return fetchRequest<Reply>(this.config, `/replies/${id}`, {
			method: "PATCH",
			body: reply,
		});
	}
}
