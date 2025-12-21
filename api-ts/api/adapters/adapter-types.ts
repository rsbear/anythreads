import type { Account, Reply, Thread, ThreadComplete, Vote } from "../schema";
import type { Result } from "../utils/result";

/**
 * The primary adapter interface for Anythreads.
 * This interface defines the methods that must be implemented by the adapter.
 */
export interface DataAdapter {
  threads: ThreadsDataAdapter;
  accounts: AccountsDataAdapter;
  replies: RepliesDataAdapter;
  votes: VotesDataAdapter;
}

// ---- Adapters

/**
 * The interface for a thread data adapter.
 * This interface defines the methods that must be implemented by a thread data adapter.
 */
export interface ThreadsDataAdapter {
  create(thread: ThreadCreate): Promise<Result<Thread>>;
  delete(id: string): Promise<Result<"ok">>;
  findOne(id: string): Promise<Result<Thread>>;
  findMany(opts?: FindManyOptions): Promise<Result<Thread[]>>;
  update(id: string, thread: ThreadUpdate): Promise<Result<Thread>>;
  complete(id: string, maxReplyDepth?: number): Promise<Result<ThreadComplete>>;
}

export interface AccountsDataAdapter {
  create: (account: AccountCreateOrUpdate) => Promise<Result<Account>>;
  update: (id: string, account: AccountUpdate) => Promise<Result<Account>>;
  delete: (id: string) => Promise<Result<Account>>;
  ban: (id: string, until: Date | null) => Promise<Result<Account>>;
  unban: (id: string) => Promise<Result<Account>>;
  findOne: (id: string) => Promise<Result<Account>>;
  findMany: (opts: FindManyOptions) => Promise<Result<Account[]>>;
}

export interface RepliesDataAdapter {
  create(reply: ReplyCreate): Promise<Result<Reply>>;
  delete(id: string): Promise<Result<"ok">>;
  findOne(id: string): Promise<Result<Reply>>;
  findMany(opts?: RepliesFindManyOptions): Promise<Result<Reply[]>>;
  update(id: string, reply: ReplyUpdate): Promise<Result<Reply>>;
}

export interface VotesDataAdapter {
  voteUp(vote: VoteInput): Promise<Result<Vote>>;
  voteDown(vote: VoteInput): Promise<Result<Vote>>;
  delete(id: string): Promise<Result<"ok">>;
  findOne(id: string): Promise<Result<Vote>>;
  findMany(opts?: VotesFindManyOptions): Promise<Result<Vote[]>>;
}

// ---- General

export type FindManyOptions = {
  where?: {
    accountId?: string;
    upstreamId?: string;
  };
  order?: {
    createdAt?: "asc" | "desc";
    updatedAt?: "asc" | "desc";
  };
  limit?: number;
  offset?: number;
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

// ---- Accounts

export type AccountCreateOrUpdate = {
  username: string;
  email?: string;
  upstreamId?: string;
  badge?: string;
  extras?: Record<string, any>;
};

export type AccountUpdate = {
  username?: string;
  email?: string;
  upstreamId?: string;
  badge?: string;
  extras?: Record<string, any>;
};

// ---- Threads

export type ThreadCreate = {
  title: string;
  body: string;
  accountId: string;
  upstreamId?: string;
  allowReplies?: boolean;
  extras?: Record<string, any>;
};

export interface ThreadUpdate {
  title?: string;
  body?: string;
  allowReplies?: boolean;
  extras?: Record<string, any>;
}

// ---- Replies

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

// ---- Votes

export type VoteInput = {
  accountId: string;
  threadId?: string;
  replyId?: string;
};
