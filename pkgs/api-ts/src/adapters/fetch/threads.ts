import { type FetchConfig, fetchRequest } from "../../common/fetch-utils.ts";
import type { Msg } from "../../common/msg.ts";
import type {
	Thread,
	ThreadComplete,
	ThreadCreate,
	ThreadsDataAdapter,
	ThreadsFindManyOptions,
	ThreadUpdate,
} from "../adapter-threads.ts";

export class FetchThreadsAdapter implements ThreadsDataAdapter {
	constructor(private config: FetchConfig) {}

	async create(thread: ThreadCreate): Promise<Msg<Thread>> {
		return fetchRequest<Thread>(this.config, "/threads", {
			method: "POST",
			body: thread,
		});
	}

	async delete(id: string): Promise<Msg<"ok">> {
		return fetchRequest<"ok">(this.config, `/threads/${id}`, {
			method: "DELETE",
		});
	}

	async findOne(id: string): Promise<Msg<Thread>> {
		return fetchRequest<Thread>(this.config, `/threads/${id}`);
	}

	async findMany(opts?: ThreadsFindManyOptions): Promise<Msg<Thread[]>> {
		const params: Record<string, any> = {};

		if (opts?.where?.accountId) params.accountId = opts.where.accountId;
		if (opts?.where?.upstreamId) params.upstreamId = opts.where.upstreamId;
		if (opts?.order?.createdAt) params.orderCreatedAt = opts.order.createdAt;
		if (opts?.order?.updatedAt) params.orderUpdatedAt = opts.order.updatedAt;
		if (opts?.limit) params.limit = opts.limit;
		if (opts?.offset) params.offset = opts.offset;

		return fetchRequest<Thread[]>(this.config, "/threads", { params });
	}

	async update(id: string, thread: ThreadUpdate): Promise<Msg<Thread>> {
		return fetchRequest<Thread>(this.config, `/threads/${id}`, {
			method: "PATCH",
			body: thread,
		});
	}

	async complete(
		id: string,
		maxReplyDepth?: number,
	): Promise<Msg<ThreadComplete>> {
		const params: Record<string, any> = {};
		if (maxReplyDepth !== undefined) params.maxReplyDepth = maxReplyDepth;

		return fetchRequest<ThreadComplete>(
			this.config,
			`/threads/${id}/complete`,
			{
				params,
			},
		);
	}
}
