"use client";

import type { Account } from "@anythreads/api/accounts";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

const AccountCtx = createContext<Account | undefined>(undefined);

export function useAccount() {
	const reply = useContext(AccountCtx);
	if (!reply) {
		throw new Error("useThread must be used within a ThreadProvider");
	}
	return reply;
}

export function Root({
	children,
	account,
	className,
}: PropsWithChildren<{ account: Account; className?: string }>) {
	if (!className) {
		return (
			<AccountCtx.Provider value={account}>{children}</AccountCtx.Provider>
		);
	}
	return (
		<AccountCtx.Provider value={account}>
			<div className={className}>{children}</div>
		</AccountCtx.Provider>
	);
}

export function Username({ className }: { className?: string }) {
	const reply = useAccount();
	if (!reply) return null;
	return <span className={className}>{reply.username}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
	const reply = useAccount();
	if (!reply) return null;
	return (
		<time dateTime={reply.createdAt} className={className}>
			{reply.createdAt}
		</time>
	);
}

export function UpdatedAt({ className }: { className?: string }) {
	const reply = useAccount();
	if (!reply) return null;
	return (
		<time dateTime={reply.updatedAt} className={className}>
			{reply.updatedAt}
		</time>
	);
}
