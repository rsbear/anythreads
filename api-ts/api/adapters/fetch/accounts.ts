import type { Account } from "../../schema";
import type { Result } from "../../utils/result";
import type {
  AccountCreateOrUpdate,
  AccountsDataAdapter,
  AccountUpdate,
  FindManyOptions,
} from "../adapter-types";
import type { FetchConfig } from "./utils";
import { fetchRequest } from "./utils";

export class FetchAccountsAdapter implements AccountsDataAdapter {
  constructor(private config: FetchConfig) {}

  async create(account: AccountCreateOrUpdate): Promise<Result<Account>> {
    return fetchRequest<Account>(this.config, "/accounts", {
      method: "POST",
      body: account,
    });
  }

  async update(id: string, account: AccountUpdate): Promise<Result<Account>> {
    return fetchRequest<Account>(this.config, `/accounts/${id}`, {
      method: "PATCH",
      body: account,
    });
  }

  async delete(id: string): Promise<Result<Account>> {
    return fetchRequest<Account>(this.config, `/accounts/${id}`, {
      method: "DELETE",
    });
  }

  async ban(id: string, until: Date | null): Promise<Result<Account>> {
    return fetchRequest<Account>(this.config, `/accounts/${id}/ban`, {
      method: "POST",
      body: { until },
    });
  }

  async unban(id: string): Promise<Result<Account>> {
    return fetchRequest<Account>(this.config, `/accounts/${id}/unban`, {
      method: "POST",
    });
  }

  async findOne(id: string): Promise<Result<Account>> {
    return fetchRequest<Account>(this.config, `/accounts/${id}`);
  }

  async findMany(opts: FindManyOptions): Promise<Result<Account[]>> {
    const params: Record<string, any> = {};

    if (opts?.where?.accountId) params.accountId = opts.where.accountId;
    if (opts?.where?.upstreamId) params.upstreamId = opts.where.upstreamId;
    if (opts?.order?.createdAt) params.orderCreatedAt = opts.order.createdAt;
    if (opts?.order?.updatedAt) params.orderUpdatedAt = opts.order.updatedAt;
    if (opts?.limit) params.limit = opts.limit;
    if (opts?.offset) params.offset = opts.offset;

    return fetchRequest<Account[]>(this.config, "/accounts", { params });
  }
}
