import type { Database } from "bun:sqlite";
import type { Account } from "../../schema.ts";
import type {
  AccountCreateOrUpdate,
  AccountsDataAdapter,
  AccountUpdate,
  FindManyOptions,
} from "../adapter-types.ts";
import { mapDbToAccount } from "../dtos.ts";
import { resultErr, resultOk, type Result } from "../../utils/result.ts";
import { createId } from "../../utils/create-id.ts";

export class BunSQLiteAccountsAdapter implements AccountsDataAdapter {
  constructor(private db: Database) {}

  public async create(account: AccountCreateOrUpdate): Promise<Result<Account>> {
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

      const result = this.db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
      return resultOk(mapDbToAccount(result));
    } catch (err) {
      console.log("ACCOUNT_CREATE", err);
      return resultErr("ACCOUNT_CREATE", "Failed to create account");
    }
  }

  public async update(id: string, account: AccountUpdate): Promise<Result<Account>> {
    try {
      const updatedAt = Date.now();
      const extras = account.extras ? JSON.stringify(account.extras) : undefined;

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

      const stmt = this.db.prepare(`UPDATE accounts SET ${updates.join(", ")} WHERE id = ?`);
      stmt.run(...values);

      const result = this.db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
      if (!result) {
        return resultErr("ACCOUNT_NOT_FOUND", `Account not found`);
      }
      return resultOk(mapDbToAccount(result));
    } catch (err) {
      console.log("ACCOUNT_UPDATE", err);
      return resultErr("ACCOUNT_UPDATE", "Failed to update account");
    }
  }

  public async ban(id: string, until: Date | null): Promise<Result<Account>> {
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

      const result = this.db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
      if (!result) {
        return resultErr("ACCOUNT_NOT_FOUND", `Account not found`);
      }
      return resultOk(mapDbToAccount(result));
    } catch (err) {
      console.log("ACCOUNT_BAN", err);
      return resultErr("ACCOUNT_BAN", "Failed to ban account");
    }
  }

  public async unban(id: string): Promise<Result<Account>> {
    try {
      const updatedAt = Date.now();

      const stmt = this.db.prepare(`
        UPDATE accounts 
        SET banned = 0, banned_at = NULL, banned_until = NULL, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(updatedAt, id);

      const result = this.db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
      if (!result) {
        return resultErr("ACCOUNT_NOT_FOUND", `Account not found`);
      }
      return resultOk(mapDbToAccount(result));
    } catch (err) {
      console.log("ACCOUNT_UNBAN", err);
      return resultErr("ACCOUNT_UNBAN", "Failed to unban account");
    }
  }

  public async delete(id: string): Promise<Result<Account>> {
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

      const result = this.db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
      if (!result) {
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }
      return resultOk(mapDbToAccount(result));
    } catch (err) {
      console.log("ACCOUNT_DELETE", err);
      return resultErr("ACCOUNT_DELETE", "Failed to delete account");
    }
  }

  public async findOne(id: string): Promise<Result<Account>> {
    try {
      const result = this.db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
      if (!result) {
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }
      return resultOk(mapDbToAccount(result));
    } catch (err) {
      console.log("ACCOUNT_FIND_ONE", err);
      return resultErr("ACCOUNT_FIND_ONE", "Failed to find account");
    }
  }

  public async findMany(opts: FindManyOptions): Promise<Result<Account[]>> {
    try {
      const limit = opts?.limit || 50;
      const offset = opts?.offset || 0;

      const results = this.db.prepare("SELECT * FROM accounts LIMIT ? OFFSET ?").all(limit, offset);
      return resultOk(results.map(mapDbToAccount));
    } catch (err) {
      console.log("ACCOUNT_FIND_MANY", err);
      return resultErr("ACCOUNT_FIND_MANY", "Failed to find accounts");
    }
  }
}
