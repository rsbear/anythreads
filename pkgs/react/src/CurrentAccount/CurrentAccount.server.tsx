import type { PropsWithChildren } from "react";
import { cache } from "react";

// Server-side "context" using React cache
const currentAccountCache = cache(() => {
	return {
		accountId: undefined as string | undefined,
	} as { accountId: string | undefined };
});

export function getCacheCurrentAccount() {
	const ctx = currentAccountCache();
	return ctx;
}

export function Provider({
	children,
	accountId,
}: PropsWithChildren<{ accountId: string }>) {
	const ctx = currentAccountCache();
	ctx.accountId = accountId;
	return <>{children}</>;
}
