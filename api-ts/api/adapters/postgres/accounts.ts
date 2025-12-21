import type { Account } from "../../schema.ts";
import { createId } from "../../utils/create-id.ts";
import { type Result, resultErr, resultOk } from "../../utils/result.ts";
import type {
  AccountCreateOrUpdate,
  AccountsDataAdapter,
  AccountUpdate,
  FindManyOptions,
} from "../adapter-types.ts";
import { mapDbToAccount } from "../dtos.ts";

export class PostgresAccountsAdapter implements AccountsDataAdapter {
  constructor(private db: any) {}

  public async create(account: AccountCreateOrUpdate): Promise<Result<Account>> {
    try {
      const id = createId();
      const now = Date.now();
      const upstreamId = account.upstreamId || null;
      const extras = JSON.stringify(account.extras || {});

      const result = await this.db.query(
        `
        INSERT INTO accounts (id, upstream_id, username, email, badge, banned, banned_at, created_at, updated_at, extras)
        VALUES ($1, $2, $3, $4, $5, false, NULL, $6, $7, $8)
        RETURNING *
      `,
        [
          id,
          upstreamId,
          account.username,
          account.email || null,
          account.badge || null,
          now,
          now,
          extras,
        ],
      );

      return resultOk(mapDbToAccount(result.rows[0]));
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
      let paramCount = 1;

      if (account.username !== undefined) {
        updates.push(`username = $${paramCount++}`);
        values.push(account.username);
      }

      if (account.email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(account.email);
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
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }

      return resultOk(mapDbToAccount(result.rows[0]));
    } catch (err) {
      console.log("ACCOUNT_UPDATE", err);
      return resultErr("ACCOUNT_UPDATE", "Failed to update account");
    }
  }

  public async ban(accountId: string, bannedUntil: Date | null): Promise<Result<Account>> {
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
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }

      return resultOk(mapDbToAccount(result.rows[0]));
    } catch (err) {
      console.log("ACCOUNT_BAN", err);
      return resultErr("ACCOUNT_BAN", "Failed to ban account");
    }
  }

  public async unban(accountId: string): Promise<Result<Account>> {
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
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }

      return resultOk(mapDbToAccount(result.rows[0]));
    } catch (err) {
      console.log("ACCOUNT_UNBAN", err);
      return resultErr("ACCOUNT_UNBAN", "Failed to unban account");
    }
  }

  public async delete(accountId: string): Promise<Result<Account>> {
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
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }

      return resultOk(mapDbToAccount(result.rows[0]));
    } catch (err) {
      console.log("ACCOUNT_DELETE", err);
      return resultErr("ACCOUNT_DELETE", "Failed to delete account");
    }
  }

  public async findOne(accountId: string): Promise<Result<Account>> {
    try {
      const result = await this.db.query(
        `
        SELECT * FROM accounts WHERE id = $1 AND deleted_at IS NULL
      `,
        [accountId],
      );

      if (result.rows.length === 0) {
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }

      return resultOk(mapDbToAccount(result.rows[0]));
    } catch (err) {
      console.log("ACCOUNT_FIND_ONE", err);
      return resultErr("ACCOUNT_FIND_ONE", "Failed to find account");
    }
  }

  public async findMany(options?: FindManyOptions): Promise<Result<Account[]>> {
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
      return resultOk(accounts);
    } catch (err) {
      console.log("ACCOUNT_FIND_MANY", err);
      return resultErr("ACCOUNT_FIND_MANY", "Failed to find accounts");
    }
  }

  public async findByUpstreamId(upstreamId: string): Promise<Result<Account>> {
    try {
      const result = await this.db.query(
        `
        SELECT * FROM accounts WHERE upstream_id = $1 AND deleted_at IS NULL
      `,
        [upstreamId],
      );

      if (result.rows.length === 0) {
        return resultErr("ACCOUNT_NOT_FOUND", "Account not found");
      }

      return resultOk(mapDbToAccount(result.rows[0]));
    } catch (err) {
      console.log("ACCOUNT_FIND_ONE", err);
      return resultErr("ACCOUNT_FIND_ONE", "Failed to find account by upstream_id");
    }
  }
}
