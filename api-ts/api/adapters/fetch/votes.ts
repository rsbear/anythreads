import type { Vote } from "../../schema";
import type { Result } from "../../utils/result";
import type { VotesDataAdapter, VotesFindManyOptions } from "../adapter-types";
import type { FetchConfig } from "./utils";
import { fetchRequest } from "./utils";

export class FetchVotesAdapter implements VotesDataAdapter {
  constructor(private config: FetchConfig) {}

  async voteUpThread(accountId: string, threadId: string): Promise<Result<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/thread/up", {
      method: "POST",
      body: { accountId, threadId },
    });
  }

  async voteDownThread(accountId: string, threadId: string): Promise<Result<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/thread/down", {
      method: "POST",
      body: { accountId, threadId },
    });
  }

  async voteUpReply(accountId: string, threadId: string, replyId: string): Promise<Result<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/reply/up", {
      method: "POST",
      body: { accountId, threadId, replyId },
    });
  }

  async voteDownReply(accountId: string, threadId: string, replyId: string): Promise<Result<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/reply/down", {
      method: "POST",
      body: { accountId, threadId, replyId },
    });
  }

  async delete(id: string): Promise<Result<"ok">> {
    return fetchRequest<"ok">(this.config, `/votes/${id}`, {
      method: "DELETE",
    });
  }

  async findOne(id: string): Promise<Result<Vote>> {
    return fetchRequest<Vote>(this.config, `/votes/${id}`);
  }

  async findMany(opts?: VotesFindManyOptions): Promise<Result<Vote[]>> {
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
