"use client";

import type { Account } from "@anythreads/api/accounts";
import * as React from "react";
import { Username } from "./composables.tsx";

const AccountCtx = React.createContext<Account | undefined>(undefined);

export function useAccount(): Account {
  const account = React.useContext(AccountCtx);
  if (!account) {
    throw new Error(
      "Account not found. Wrap your app with <Account.Provider account={account}>",
    );
  }
  return account;
}

export function Provider(
  props: React.PropsWithChildren<{ account: Account; className?: string }>,
) {
  if (!props?.className) {
    <AccountCtx.Provider value={props.account}>
      {props.children}
    </AccountCtx.Provider>;
  }

  return (
    <AccountCtx.Provider value={props.account}>
      <div className={props.className}>{props.children}</div>
    </AccountCtx.Provider>
  );
}

export { Username };
