import type { FetchConfig } from "../../common/fetch-utils.ts";
import { fetchRequest } from "../../common/fetch-utils.ts";
import type { Msg } from "../../common/msg";
import type { Vote, VotesDataAdapter, VotesFindManyOptions } from "../adapter-votes.ts";

export class FetchVotesAdapter implements VotesDataAdapter {
  constructor(private config: FetchConfig) {}

  async voteUpThread(accountId: string, threadId: string): Promise<Msg<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/thread/up", {
      method: "POST",
      body: { accountId, threadId },
    });
  }

  async voteDownThread(accountId: string, threadId: string): Promise<Msg<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/thread/down", {
      method: "POST",
      body: { accountId, threadId },
    });
  }

  async voteUpReply(
    accountId: string,
    threadId: string,
    replyId: string,
  ): Promise<Msg<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/reply/up", {
      method: "POST",
      body: { accountId, threadId, replyId },
    });
  }

  async voteDownReply(
    accountId: string,
    threadId: string,
    replyId: string,
  ): Promise<Msg<Vote>> {
    return fetchRequest<Vote>(this.config, "/votes/reply/down", {
      method: "POST",
      body: { accountId, threadId, replyId },
    });
  }

  async delete(id: string): Promise<Msg<"ok">> {
    return fetchRequest<"ok">(this.config, `/votes/${id}`, {
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
