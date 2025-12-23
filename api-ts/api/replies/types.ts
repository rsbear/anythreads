import type { Result } from "../../utils/result.ts";

export interface RepliesDataAdapter {
  create(reply: ReplyCreate): Promise<Result<Reply>>;
  delete(id: string): Promise<Result<"ok">>;
  findOne(id: string): Promise<Result<Reply>>;
  findMany(opts?: RepliesFindManyOptions): Promise<Result<Reply[]>>;
  update(id: string, reply: ReplyUpdate): Promise<Result<Reply>>;
}

export type Reply = {
  id: string;
  threadId: string;
  accountId: string;
  body: string;
  replyToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  extras: Record<string, any>;
};

export type RepliesFindManyOptions = {
  where?: {
    accountId?: string;
    upstreamId?: string;
    threadId?: string;
    replyToId?: string | null;
  };
  order?: {
    createdAt?: "asc" | "desc";
    updatedAt?: "asc" | "desc";
  };
  limit?: number;
  offset?: number;
};

export type ReplyCreate = {
  threadId: string;
  accountId: string;
  body: string;
  replyToId?: string;
  extras?: Record<string, any>;
};

export type ReplyUpdate = {
  body?: string;
  extras?: Record<string, any>;
};
