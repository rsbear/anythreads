import React, { createContext, useContext } from 'react'
import { Reply } from "@anythreads/api/replies"


const ReplyCtx = createContext<Reply | null>(null)

export const useReply = () => {
  const reply = useContext(ReplyCtx)
  if (!reply) throw new Error("Must be used within <Reply.Provider>")
  return reply
}

export function Provider({ children, value }: { children: React.ReactNode, value: Reply }) {
  return (
    <ReplyCtx.Provider value={value}>{children}</ReplyCtx.Provider>
  )
}








