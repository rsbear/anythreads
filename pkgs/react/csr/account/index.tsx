import type { Account } from "@anythreads/api/accounts";
import { createContext, useContext } from "react";

const AccountRoot = createContext<Account | undefined>(undefined);

export function useAccount() {
  const account = useContext(AccountRoot);
  if (!account) {
    throw new Error("useAccount must be used within a Account.Root");
  }
  return account;
}

export function Root({ account, children }: React.PropsWithChildren<{ account: Account }>) {
  return <AccountRoot.Provider value={account}>{children}</AccountRoot.Provider>;
}

export function Username({ className }: { className?: string }) {
  const account = useContext(AccountRoot);
  if (!account) return null;
  return <span className={className}>{account.username}</span>;
}

export function Email({ className }: { className?: string }) {
  const account = useContext(AccountRoot);
  if (!account) return null;
  return <span className={className}>{account.email}</span>;
}
