import { type FetchConfig, fetchRequest } from "../../common/fetch-utils.ts";

import type { Msg } from "../../common/msg.ts";
import type {
	Account,
	AccountCreateOrUpdate,
	AccountsDataAdapter,
	AccountsFindManyOptions,
	AccountUpdate,
	VotesInThread,
	VotesInThreadInput,
} from "../adapter-accounts.ts";

export class FetchAccountsAdapter implements AccountsDataAdapter {
	constructor(private config: FetchConfig) {}

	async create(account: AccountCreateOrUpdate): Promise<Msg<Account>> {
		return fetchRequest<Account>(this.config, "/accounts", {
			method: "POST",
			body: account,
		});
	}

	async update(id: string, account: AccountUpdate): Promise<Msg<Account>> {
		return fetchRequest<Account>(this.config, `/accounts/${id}`, {
			method: "PATCH",
			body: account,
		});
	}

	async delete(id: string): Promise<Msg<Account>> {
		return fetchRequest<Account>(this.config, `/accounts/${id}`, {
			method: "DELETE",
		});
	}

	async ban(id: string, until: Date | null): Promise<Msg<Account>> {
		return fetchRequest<Account>(this.config, `/accounts/${id}/ban`, {
			method: "POST",
			body: { until },
		});
	}

	async unban(id: string): Promise<Msg<Account>> {
		return fetchRequest<Account>(this.config, `/accounts/${id}/unban`, {
			method: "POST",
		});
	}

	async findOne(id: string): Promise<Msg<Account>> {
		return fetchRequest<Account>(this.config, `/accounts/${id}`);
	}

	async findMany(opts: AccountsFindManyOptions): Promise<Msg<Account[]>> {
		const params: Record<string, any> = {};

		if (opts?.where?.accountId) params.accountId = opts.where.accountId;
		if (opts?.where?.upstreamId) params.upstreamId = opts.where.upstreamId;
		if (opts?.order?.createdAt) params.orderCreatedAt = opts.order.createdAt;
		if (opts?.order?.updatedAt) params.orderUpdatedAt = opts.order.updatedAt;
		if (opts?.limit) params.limit = opts.limit;
		if (opts?.offset) params.offset = opts.offset;

		return fetchRequest<Account[]>(this.config, "/accounts", { params });
	}

	async personalizedThread(
		opts: VotesInThreadInput,
	): Promise<Msg<VotesInThread>> {
		return fetchRequest<VotesInThread>(
			this.config,
			`/accounts/${opts.accountId}/threads/${opts.threadId}/votes`,
		);
	}
}
