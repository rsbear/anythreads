import type { Thread, ThreadComplete } from "../../schema";
import type { Result } from "../../utils/result";
import type {
  FindManyOptions,
  ThreadCreate,
  ThreadsDataAdapter,
  ThreadUpdate,
} from "../adapter-types";
import type { FetchConfig } from "./utils";
import { fetchRequest } from "./utils";

export class FetchThreadsAdapter implements ThreadsDataAdapter {
  constructor(private config: FetchConfig) { }

  async create(thread: ThreadCreate): Promise<Result<Thread>> {
    return fetchRequest<Thread>(this.config, "/threads", {
      method: "POST",
      body: thread,
    });
  }

  async delete(id: string): Promise<Result<"ok">> {
    return fetchRequest<"ok">(this.config, `/threads/${id}`, {
      method: "DELETE",
    });
  }

  async findOne(id: string): Promise<Result<Thread>> {
    return fetchRequest<Thread>(this.config, `/threads/${id}`);
  }

  async findMany(opts?: FindManyOptions): Promise<Result<Thread[]>> {
    const params: Record<string, any> = {};

    if (opts?.where?.accountId) params.accountId = opts.where.accountId;
    if (opts?.where?.upstreamId) params.upstreamId = opts.where.upstreamId;
    if (opts?.order?.createdAt) params.orderCreatedAt = opts.order.createdAt;
    if (opts?.order?.updatedAt) params.orderUpdatedAt = opts.order.updatedAt;
    if (opts?.limit) params.limit = opts.limit;
    if (opts?.offset) params.offset = opts.offset;

    return fetchRequest<Thread[]>(this.config, "/threads", { params });
  }

  async update(id: string, thread: ThreadUpdate): Promise<Result<Thread>> {
    return fetchRequest<Thread>(this.config, `/threads/${id}`, {
      method: "PATCH",
      body: thread,
    });
  }

  async complete(id: string, maxReplyDepth?: number): Promise<Result<ThreadComplete>> {
    const params: Record<string, any> = {};
    if (maxReplyDepth !== undefined) params.maxReplyDepth = maxReplyDepth;

    return fetchRequest<ThreadComplete>(this.config, `/threads/${id}/complete`, { params });
  }

  async userVotes(params: {
    accountId: string;
    threadId: string;
    toHash: boolean;
  }): Promise<
    Result<import("../../schema").UserVote[] | Record<string, import("../../schema").UserVote>>
  > {
    const queryParams: Record<string, any> = {
      toHash: params.toHash,
    };

    return fetchRequest<
      import("../../schema").UserVote[] | Record<string, import("../../schema").UserVote>
    >(this.config, `/threads/${params.threadId}/votes/${params.accountId}`, {
      params: queryParams,
    });
  }
}
