import type { Result } from "../../utils/result";

export interface VotesDataAdapter {
  voteUpThread(accountId: string, threadId: string): Promise<Result<Vote>>;
  voteDownThread(accountId: string, threadId: string): Promise<Result<Vote>>;
  voteUpReply(accountId: string, threadId: string, replyId: string): Promise<Result<Vote>>;
  voteDownReply(accountId: string, threadId: string, replyId: string): Promise<Result<Vote>>;
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
