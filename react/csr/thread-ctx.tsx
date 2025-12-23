import type { Result } from "@anythreads/api/result";
import type { ThreadComplete } from "@anythreads/api/threads";
import React from "react";

import { useAnythreads } from "./anythreads-ctx";

const ThreadDataCtx = React.createContext<{
  thread: Result<ThreadComplete> | undefined;
  pickAsync: (id: string) => Promise<void>;
}>({
  thread: undefined,
  pickAsync: async (_id: string) => {},
});

export const useThreadData = () => {
  const state = React.useContext(ThreadDataCtx);
  if (!state) {
    throw new Error("useThreadCtx must be used within a ThreadProvider");
  }
  return state;
};

export function ThreadDataProvider({ children }: React.PropsWithChildren) {
  const at = useAnythreads();

  const [result, setResult] = React.useState<Result<ThreadComplete> | undefined>(undefined);

  const pickAsync = React.useCallback(
    async (id: string) => {
      if (!at) return;
      const res = await at.threads.complete(id);
      setResult(res);
    },
    [at],
  );

  return (
    <ThreadDataCtx.Provider
      value={{
        thread: result,
        pickAsync,
      }}
    >
      {children}
    </ThreadDataCtx.Provider>
  );
}
