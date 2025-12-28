import type { Account } from "@anythreads/api/accounts";
import type { Result } from "@anythreads/api/result";
import React from "react";

import { useAnythreads } from "../anythreads-ctx";

const CurrentAccountCtx = React.createContext<Result<Account> | undefined>(undefined);

export function CurrentAccountProvider({
  currentAccountId,
  children,
}: React.PropsWithChildren<{ currentAccountId: string }>) {
  const [result, setResult] = React.useState<Result<Account> | undefined>(undefined);

  const at = useAnythreads();

  const refetch = React.useCallback(async () => {
    if (!at) return;
    at.accounts.findOne(currentAccountId).then(setResult).catch(console.error);
  }, [at, currentAccountId]);

  React.useEffect(() => {
    if (!at || !refetch) return;
    refetch();
  }, [at, refetch]);

  return <CurrentAccountCtx.Provider value={result}>{children}</CurrentAccountCtx.Provider>;
}

export function useCurrentAccount() {
  const currentAccountId = React.useContext(CurrentAccountCtx);
  if (!currentAccountId) {
    throw new Error("useCurrentAccount must be used within a CurrentAccountProvider");
  }
  return currentAccountId;
}
