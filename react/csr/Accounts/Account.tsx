import React, { createContext, useContext } from 'react'
import type { Account } from "@anythreads/api/accounts";


const AccountCtx = createContext<Account | null>(null)

export const useAccount = () => {
  const account = useContext(AccountCtx)
  if (!account) throw new Error("Must be used within <Account.Provider>")
  return account
}

export function Provider({ children, value }: { children: React.ReactNode, value: Account }) {
  return (
    <AccountCtx.Provider value={value}>{children}</AccountCtx.Provider>
  )
}

export function Username({ className }: { className?: string }) {
  const account = useContext(AccountCtx)
  if (!account) return null
  return <span className={className}>{account.username}</span>
}
