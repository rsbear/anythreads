import type { ReadContext, WriteContext } from "../common/context.ts";
import type { Msg } from "../common/msg.ts";
import type { Vote } from "./adapter-votes.ts";

export interface AccountsDataAdapter {
	// Write operations - support moderation + cache context
	create: (
		account: AccountCreateOrUpdate,
		ctx?: WriteContext,
	) => Promise<Msg<Account>>;
	update: (
		id: string,
		account: AccountUpdate,
		ctx?: WriteContext,
	) => Promise<Msg<Account>>;
	delete: (id: string, ctx?: WriteContext) => Promise<Msg<Account>>;
	ban: (
		id: string,
		until: Date | null,
		ctx?: WriteContext,
	) => Promise<Msg<Account>>;
	unban: (id: string, ctx?: WriteContext) => Promise<Msg<Account>>;

	// Read operations - support cache context only
	findOne: (id: string, ctx?: ReadContext) => Promise<Msg<Account>>;
	findMany: (
		opts: AccountsFindManyOptions,
		ctx?: ReadContext,
	) => Promise<Msg<Account[]>>;
	personalizedThread: (
		opts: PersonalizedThreadInput,
		ctx?: ReadContext,
	) => Promise<Msg<PersonalizedThread>>;
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
	avatar: string | null;
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
	avatar?: string;
	upstreamId?: string;
	badge?: string;
	extras?: Record<string, any>;
};

export type AccountUpdate = {
	username?: string;
	email?: string;
	avatar?: string;
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

export type PersonalizedThreadInput = {
	accountId: string;
	threadId: string;
};

export type PersonalizedThread = Record<string, Partial<Vote>>;
