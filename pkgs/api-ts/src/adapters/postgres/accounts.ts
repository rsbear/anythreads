import { createId } from "../../common/create-id.ts";
import { err, type Msg, none, some } from "../../common/msg.ts";
import type {
	Account,
	AccountCreateOrUpdate,
	AccountsDataAdapter,
	AccountsFindManyOptions,
	AccountUpdate,
	PersonalizedThread,
	PersonalizedThreadInput,
} from "../adapter-accounts.ts";
import { mapDbToAccount } from "../maps.ts";

export class PostgresAccountsAdapter implements AccountsDataAdapter {
	constructor(private db: any) {}

	public async create(account: AccountCreateOrUpdate): Promise<Msg<Account>> {
		try {
			const id = createId();
			const now = Date.now();
			const upstreamId = account.upstreamId || null;
			const extras = JSON.stringify(account.extras || {});

			const result = await this.db.query(
				`
        INSERT INTO accounts (id, upstream_id, username, email, avatar, badge, banned, banned_at, created_at, updated_at, extras)
        VALUES ($1, $2, $3, $4, $5, $6, false, NULL, $7, $8, $9)
        RETURNING *
      `,
				[
					id,
					upstreamId,
					account.username,
					account.email || null,
					account.avatar || null,
					account.badge || null,
					now,
					now,
					extras,
				],
			);

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_CREATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to create account", metadata);
		}
	}

	public async update(
		id: string,
		account: AccountUpdate,
	): Promise<Msg<Account>> {
		try {
			const updatedAt = Date.now();
			const extras = account.extras
				? JSON.stringify(account.extras)
				: undefined;

			const updates: string[] = [];
			const values: any[] = [];
			let paramCount = 1;

			if (account.username !== undefined) {
				updates.push(`username = $${paramCount++}`);
				values.push(account.username);
			}

			if (account.email !== undefined) {
				updates.push(`email = $${paramCount++}`);
				values.push(account.email);
			}

			if (account.avatar !== undefined) {
				updates.push(`avatar = $${paramCount++}`);
				values.push(account.avatar);
			}

			if (account.badge !== undefined) {
				updates.push(`badge = $${paramCount++}`);
				values.push(account.badge);
			}

			if (extras !== undefined) {
				updates.push(`extras = $${paramCount++}`);
				values.push(extras);
			}

			updates.push(`updated_at = $${paramCount++}`);
			values.push(updatedAt);
			values.push(id);

			const result = await this.db.query(
				`
        UPDATE accounts
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `,
				values,
			);

			if (result.rows.length === 0) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_UPDATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to update account", metadata);
		}
	}

	public async ban(
		accountId: string,
		bannedUntil: Date | null,
	): Promise<Msg<Account>> {
		try {
			const bannedAt = Date.now();
			const result = await this.db.query(
				`
        UPDATE accounts
        SET banned = true, banned_at = $1, banned_until = $2, updated_at = $3
        WHERE id = $4
        RETURNING *
      `,
				[bannedAt, bannedUntil || null, bannedAt, accountId],
			);

			if (result.rows.length === 0) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_BAN", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to ban account", metadata);
		}
	}

	public async unban(accountId: string): Promise<Msg<Account>> {
		try {
			const updatedAt = Date.now();
			const result = await this.db.query(
				`
        UPDATE accounts
        SET banned = false, banned_at = NULL, banned_until = NULL, updated_at = $1
        WHERE id = $2
        RETURNING *
      `,
				[updatedAt, accountId],
			);

			if (result.rows.length === 0) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_UNBAN", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to unban account", metadata);
		}
	}

	public async delete(accountId: string): Promise<Msg<Account>> {
		try {
			const deletedAt = Date.now();
			const result = await this.db.query(
				`
        UPDATE accounts
        SET deleted_at = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
      `,
				[deletedAt, deletedAt, accountId],
			);

			if (result.rows.length === 0) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_DELETE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to delete account", metadata);
		}
	}

	public async findOne(accountId: string): Promise<Msg<Account>> {
		try {
			const result = await this.db.query(
				`
        SELECT * FROM accounts WHERE id = $1 AND deleted_at IS NULL
      `,
				[accountId],
			);

			if (result.rows.length === 0) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find account", metadata);
		}
	}

	public async findMany(
		options?: AccountsFindManyOptions,
	): Promise<Msg<Account[]>> {
		try {
			const limit = options?.limit || 10;
			const offset = options?.offset || 0;

			const result = await this.db.query(
				`
        SELECT * FROM accounts
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
				[limit, offset],
			);

			const accounts = result.rows.map(mapDbToAccount);
			return some(accounts);
		} catch (error) {
			console.log("ACCOUNT_FIND_MANY", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find accounts", metadata);
		}
	}

	public async findByUpstreamId(upstreamId: string): Promise<Msg<Account>> {
		try {
			const result = await this.db.query(
				`
        SELECT * FROM accounts WHERE upstream_id = $1 AND deleted_at IS NULL
      `,
				[upstreamId],
			);

			if (result.rows.length === 0) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result.rows[0]));
		} catch (error) {
			console.log("ACCOUNT_FIND_ONE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find account by upstream_id", metadata);
		}
	}

	public async personalizedThread(
		opts: PersonalizedThreadInput,
	): Promise<Msg<PersonalizedThread>> {
		const { accountId, threadId } = opts;
		try {
			const result = await this.db.query(
				`
        SELECT
          id,
          thread_id,
          reply_id,
          account_id,
          direction
        FROM votes
        WHERE thread_id = $1 AND account_id = $2
      `,
				[threadId, accountId],
			);

			const voteHash: PersonalizedThread = {};
			for (const vote of result.rows) {
				const key = vote.reply_id
					? `reply:${vote.reply_id}`
					: `thread:${vote.thread_id}`;
				voteHash[key] = {
					id: vote.id,
					threadId: vote.thread_id,
					replyId: vote.reply_id,
					accountId: vote.account_id,
					direction: vote.direction as "up" | "down",
				};
			}
			return some(voteHash);
		} catch (error) {
			console.log("VOTES_IN_THREAD", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to fetch votes in thread", metadata);
		}
	}
}
