import type { Result } from "../common/result";

export interface VotesDataAdapter {
  voteUpThread(accountId: string, threadId: string): Promise<Result<Vote>>;
  voteDownThread(accountId: string, threadId: string): Promise<Result<Vote>>;
  voteUpReply(accountId: string, threadId: string, replyId: string): Promise<Result<Vote>>;
  voteDownReply(accountId: string, threadId: string, replyId: string): Promise<Result<Vote>>;
  threadUser(
    threadId: string,
    accountId: string,
    options?: { asList: true },
  ): Promise<Result<Partial<Vote>[]>>;
  threadUser(
    threadId: string,
    accountId: string,
    options?: { asList: false },
  ): Promise<Result<Record<string, Partial<Vote>>[]>>;
  delete(id: string): Promise<Result<"ok">>;
  findOne(id: string): Promise<Result<Vote>>;
  findMany(opts?: VotesFindManyOptions): Promise<Result<Vote[]>>;
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
