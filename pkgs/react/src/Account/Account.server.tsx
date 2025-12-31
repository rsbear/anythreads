import type { Account } from "@anythreads/api/accounts";
import type { PropsWithChildren } from "react";
import { cache } from "react";

// Server-side "context" using React cache
const getAccountCtx = cache(() => {
	return {
		account: undefined as Account | undefined,
	};
});

export function useAccount() {
	const ctx = getAccountCtx();
	return ctx;
}

export function Root({
	children,
	account,
}: PropsWithChildren<{ account: Account }>) {
	const ctx = getAccountCtx();
	ctx.account = account;
	return <>{children}</>;
}

export function Username({ className }: { className?: string }) {
	const { account } = useAccount();
	if (!account) return null;
	return <span className={className}>{account.username}</span>;
}
