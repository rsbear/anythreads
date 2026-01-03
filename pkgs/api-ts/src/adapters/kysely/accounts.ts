import type { Kysely } from "kysely";
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
import type { Database } from "./types.ts";

export class KyselyAccountsAdapter implements AccountsDataAdapter {
	constructor(private db: Kysely<Database>) {}

	public async create(account: AccountCreateOrUpdate): Promise<Msg<Account>> {
		try {
			const id = createId();
			const now = Date.now();
			const upstreamId = account.upstreamId || null;
			const extras = JSON.stringify(account.extras || {});

			await this.db
				.insertInto("accounts")
				.values({
					id,
					upstream_id: upstreamId,
					username: account.username,
					email: account.email || null,
					avatar: account.avatar || null,
					badge: account.badge || null,
					banned: 0,
					banned_at: null,
					created_at: now.toString(),
					updated_at: now.toString(),
					extras,
				})
				.execute();

			const result = await this.db
				.selectFrom("accounts")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return err("Failed to retrieve created account");
			}

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

			let query = this.db.updateTable("accounts");

			if (account.username !== undefined) {
				query = query.set({ username: account.username });
			}
			if (account.email !== undefined) {
				query = query.set({ email: account.email });
			}
			if (account.avatar !== undefined) {
				query = query.set({ avatar: account.avatar });
			}
			if (account.upstreamId !== undefined) {
				query = query.set({ upstream_id: account.upstreamId });
			}
			if (account.badge !== undefined) {
				query = query.set({ badge: account.badge });
			}
			if (extras !== undefined) {
				query = query.set({ extras });
			}

			query = query.set({ updated_at: updatedAt.toString() });

			await query.where("id", "=", id).execute();

			const result = await this.db
				.selectFrom("accounts")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

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

			await this.db
				.updateTable("accounts")
				.set({
					banned: 1,
					banned_at: bannedAt.toString(),
					updated_at: updatedAt.toString(),
				})
				.where("id", "=", id)
				.execute();

			const result = await this.db
				.selectFrom("accounts")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!result) {
				return none("Account not found");
			}

			return some(mapDbToAccount(result));
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

			await this.db
				.updateTable("accounts")
				.set({
					banned: 0,
					banned_at: null,
					updated_at: updatedAt.toString(),
				})
				.where("id", "=", id)
				.execute();

			const result = await this.db
				.selectFrom("accounts")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

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

			await this.db
				.updateTable("accounts")
				.set({
					deleted_at: deletedAt.toString(),
					updated_at: updatedAt.toString(),
					username: randomUsername,
					email: null,
				})
				.where("id", "=", id)
				.execute();

			const result = await this.db
				.selectFrom("accounts")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

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
			const result = await this.db
				.selectFrom("accounts")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

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

			let query = this.db.selectFrom("accounts").selectAll();

			if (opts?.where?.accountId) {
				query = query.where("id", "=", opts.where.accountId);
			}

			if (opts?.where?.upstreamId) {
				query = query.where("upstream_id", "=", opts.where.upstreamId);
			}

			if (opts?.order?.createdAt) {
				query = query.orderBy("created_at", opts.order.createdAt);
			} else if (opts?.order?.updatedAt) {
				query = query.orderBy("updated_at", opts.order.updatedAt);
			} else {
				query = query.orderBy("created_at", "desc");
			}

			const results = await query.limit(limit).offset(offset).execute();

			return some(results.map(mapDbToAccount));
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
			const results = await this.db
				.selectFrom("votes")
				.select(["id", "thread_id", "reply_id", "account_id", "direction"])
				.where("thread_id", "=", threadId)
				.where("account_id", "=", accountId)
				.execute();

			const voteHash: PersonalizedThread = {};
			for (const vote of results) {
				const key = vote.reply_id
					? `reply:${vote.reply_id}`
					: `thread:${vote.thread_id}`;
				voteHash[key] = {
					id: vote.id,
					threadId: vote.thread_id,
					replyId: vote.reply_id,
					accountId: vote.account_id,
					direction: vote.direction,
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
