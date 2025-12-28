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

export class SQLite3AccountsAdapter implements AccountsDataAdapter {
	constructor(private db: any) {}

	public async create(account: AccountCreateOrUpdate): Promise<Msg<Account>> {
		try {
			const id = createId();
			const now = Date.now();
			const upstreamId = account.upstreamId || null;
			const extras = JSON.stringify(account.extras || {});

			const stmt = this.db.prepare(`
        INSERT INTO accounts (id, upstream_id, username, email, badge, banned, banned_at, created_at, updated_at, extras)
        VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?)
      `);
			stmt.run(
				id,
				upstreamId,
				account.username,
				account.email || null,
				account.badge || null,
				now,
				now,
				extras,
			);

			const result = this.db
				.prepare("SELECT * FROM accounts WHERE id = ?")
				.get(id);
			return some(mapDbToAccount(result));
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

			if (account.username !== undefined) {
				updates.push("username = ?");
				values.push(account.username);
			}
			if (account.email !== undefined) {
				updates.push("email = ?");
				values.push(account.email);
			}
			if (account.upstreamId !== undefined) {
				updates.push("upstream_id = ?");
				values.push(account.upstreamId);
			}
			if (account.badge !== undefined) {
				updates.push("badge = ?");
				values.push(account.badge);
			}
			if (extras !== undefined) {
				updates.push("extras = ?");
				values.push(extras);
			}

			updates.push("updated_at = ?");
			values.push(updatedAt);
			values.push(id);

			const stmt = this.db.prepare(
				`UPDATE accounts SET ${updates.join(", ")} WHERE id = ?`,
			);
			stmt.run(...values);

			const result = this.db
				.prepare("SELECT * FROM accounts WHERE id = ?")
				.get(id);
			if (!result) {
				return none("Account not found");
			}
			return some(mapDbToAccount(result));
		} catch (error) {
			console.log("ACCOUNT_UPDATE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to update account", metadata);
		}
	}

	public async ban(id: string, until: Date | null): Promise<Msg<Account>> {
		try {
			const bannedAt = Date.now();
			const bannedUntil = until ? until.getTime() : null;
			const updatedAt = Date.now();

			const stmt = this.db.prepare(`
        UPDATE accounts
        SET banned = 1, banned_at = ?, banned_until = ?, updated_at = ?
        WHERE id = ?
      `);
			stmt.run(bannedAt, bannedUntil, updatedAt, id);

			const retrievedAccount = this.db
				.prepare("SELECT * FROM accounts WHERE id = ?")
				.get(id);
			if (!retrievedAccount) {
				return none("Account not found");
			}
			return some(mapDbToAccount(retrievedAccount));
		} catch (error) {
			console.log("ACCOUNT_BAN", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to ban account", metadata);
		}
	}

	public async unban(id: string): Promise<Msg<Account>> {
		try {
			const updatedAt = Date.now();

			const stmt = this.db.prepare(`
        UPDATE accounts
        SET banned = 0, banned_at = NULL, banned_until = NULL, updated_at = ?
        WHERE id = ?
      `);
			stmt.run(updatedAt, id);

			const result = this.db
				.prepare("SELECT * FROM accounts WHERE id = ?")
				.get(id);
			if (!result) {
				return none("Account not found");
			}
			return some(mapDbToAccount(result));
		} catch (error) {
			console.log("ACCOUNT_UNBAN", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to unban account", metadata);
		}
	}

	public async delete(id: string): Promise<Msg<Account>> {
		try {
			const deletedAt = Date.now();
			const updatedAt = Date.now();
			const randomUsername = `random-${crypto.randomUUID()}-${Math.floor(Math.random() * 10000)}`;

			const stmt = this.db.prepare(`
        UPDATE accounts
        SET deleted_at = ?, updated_at = ?, username = ?, email = NULL
        WHERE id = ?
      `);
			stmt.run(deletedAt, updatedAt, randomUsername, id);

			const result = this.db
				.prepare("SELECT * FROM accounts WHERE id = ?")
				.get(id);
			if (!result) {
				return none("Account not found");
			}
			return some(mapDbToAccount(result));
		} catch (error) {
			console.log("ACCOUNT_DELETE", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to delete account", metadata);
		}
	}

	public async findOne(id: string): Promise<Msg<Account>> {
		try {
			const result = this.db
				.prepare("SELECT * FROM accounts WHERE id = ?")
				.get(id);
			if (!result) {
				return none("Account not found");
			}
			return some(mapDbToAccount(result));
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
		opts: AccountsFindManyOptions,
	): Promise<Msg<Account[]>> {
		try {
			const limit = opts?.limit || 50;
			const offset = opts?.offset || 0;

			const results = this.db
				.prepare("SELECT * FROM accounts LIMIT ? OFFSET ?")
				.all(limit, offset);

			return some((results as any[]).map(mapDbToAccount));
		} catch (error) {
			console.log("ACCOUNT_FIND_MANY", error);
			const metadata =
				error instanceof Error
					? { error: error.message }
					: { error: String(error) };
			return err("Failed to find accounts", metadata);
		}
	}

	public async personalizedThread(
		opts: PersonalizedThreadInput,
	): Promise<Msg<PersonalizedThread>> {
		const { accountId, threadId } = opts;
		try {
			const votes = this.db
				.prepare(
					`
        SELECT
          thread_id,
          reply_id,
          account_id,
          direction
        FROM votes
        WHERE thread_id = ? AND account_id = ?
      `,
				)
				.all(threadId, accountId) as Array<{
				thread_id: string;
				reply_id: string | null;
				account_id: string;
				direction: string;
			}>;

			const voteHash: PersonalizedThread = {};
			for (const vote of votes) {
				const key = vote.reply_id
					? `reply:${vote.reply_id}`
					: `thread:${vote.thread_id}`;
				voteHash[key] = {
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
