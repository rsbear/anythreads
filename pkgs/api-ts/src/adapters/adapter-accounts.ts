import type { Msg } from "../common/msg.ts";
import type { Vote } from "./adapter-votes.ts";

export interface AccountsDataAdapter {
  create: (account: AccountCreateOrUpdate) => Promise<Msg<Account>>;
  update: (id: string, account: AccountUpdate) => Promise<Msg<Account>>;
  delete: (id: string) => Promise<Msg<Account>>;
  ban: (id: string, until: Date | null) => Promise<Msg<Account>>;
  unban: (id: string) => Promise<Msg<Account>>;
  findOne: (id: string) => Promise<Msg<Account>>;
  findMany: (opts: AccountsFindManyOptions) => Promise<Msg<Account[]>>;
  votesInThread: (opts: VotesInThreadInput) => Promise<Msg<VotesInThread>>;
}

/**
 * type Account
 *
 * A mostly 1:1 match between types and what exist in the database
 */
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

// ---- Function input/outputs regarding accounts

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

export type AccountsFindManyOptions = {
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

export type VotesInThreadInput = {
  accountId: string;
  threadId: string;
};

export type VotesInThread = Record<string, Partial<Vote>>;
