import type { ColumnType, Generated, JSONColumnType } from "kysely";

/**
 * Accounts table schema
 */
export interface AccountsTable {
	id: Generated<string>;
	upstream_id: string | null;
	username: string;
	email: string | null;
	avatar: string | null;
	badge: string | null;
	banned: Generated<number>;
	banned_at: ColumnType<Date | null, string | null, string | null>;
	created_at: ColumnType<Date, string, never>;
	updated_at: ColumnType<Date, string, string>;
	deleted_at: ColumnType<Date | null, string | null, string | null>;
	extras: JSONColumnType<Record<string, any>>;
}

/**
 * Threads table schema
 */
export interface ThreadsTable {
	id: Generated<string>;
	account_id: string;
	upstream_id: string | null;
	title: string;
	body: string;
	allow_replies: Generated<number>;
	created_at: ColumnType<Date, string, never>;
	updated_at: ColumnType<Date, string, string>;
	deleted_at: ColumnType<Date | null, string | null, string | null>;
	extras: JSONColumnType<Record<string, any>>;
}

/**
 * Replies table schema
 */
export interface RepliesTable {
	id: Generated<string>;
	thread_id: string;
	account_id: string;
	body: string;
	reply_to_id: string | null;
	created_at: ColumnType<Date, string, never>;
	updated_at: ColumnType<Date, string, string>;
	deleted_at: ColumnType<Date | null, string | null, string | null>;
	extras: JSONColumnType<Record<string, any>>;
}

/**
 * Votes table schema
 */
export interface VotesTable {
	id: Generated<string>;
	thread_id: string | null;
	account_id: string;
	reply_id: string | null;
	direction: "up" | "down";
	created_at: ColumnType<Date, string, never>;
	updated_at: ColumnType<Date, string, string>;
}

/**
 * Database interface with all tables
 */
export interface Database {
	accounts: AccountsTable;
	threads: ThreadsTable;
	replies: RepliesTable;
	votes: VotesTable;
}
