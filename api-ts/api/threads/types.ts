import type { Result } from "../../utils/result";

/**
 * The interface for a thread data adapter.
 * This interface defines the methods that must be implemented by a thread data adapter.
 */
export interface ThreadsDataAdapter {
  create(thread: ThreadCreate): Promise<Result<Thread>>;
  delete(id: string): Promise<Result<"ok">>;
  findOne(id: string): Promise<Result<Thread>>;
  findMany(opts?: ThreadsFindManyOptions): Promise<Result<Thread[]>>;
  update(id: string, thread: ThreadUpdate): Promise<Result<Thread>>;
  complete(id: string, maxReplyDepth?: number): Promise<Result<ThreadComplete>>;
  userVotes(params: {
    accountId: string;
    threadId: string;
    toHash: boolean;
  }): Promise<Result<UserVote[] | Record<string, UserVote>>>;
}

export type Thread = {
  id: string;
  accountId: string;
  /** An external id such as product ID, Blog post ID, etc. */
  upstreamId: string | null;
  title: string;
  body: string;
  allowReplies: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  extras: Record<string, any>;
};

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

export type ThreadsFindManyOptions = {
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

// ----- Thread as full tree with replies, accounts, votes

export type VoteCount = {
  upvotes: number;
  downvotes: number;
  total: number;
};

export type UserVote = {
  threadId: string;
  replyId: string | null;
  accountId: string;
  direction: "up" | "down" | "none";
};

export interface ReplyWithNested extends Reply {
  account: Account;
  voteCount: VoteCount;
  replies: ReplyWithNested[];
}

export interface ThreadWithDetails extends Thread {
  account: Account;
  voteCount: VoteCount;
}

export interface ThreadComplete {
  thread: ThreadWithDetails;
  replies: ReplyWithNested[];
}
