export type Account = {
  id: string;
  /** An external id such as Firebase UID, Supabase ID, etc. */
  upstreamId: string | null;
  username: string;
  email: string | null;
  badge: string | null;
  banned: boolean;
  bannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  extras: Record<string, any>;
};

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

export type Vote = {
  id: string;
  threadId: string | null;
  accountId: string;
  replyId: string | null;
  direction: "up" | "down";
  createdAt: Date;
  updatedAt: Date;
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
