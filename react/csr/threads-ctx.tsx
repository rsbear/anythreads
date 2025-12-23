import type { Result } from "@anythreads/api/result";
import type { Thread } from "@anythreads/api/threads";
import React from "react";

import { useAnythreads } from "./anythreads-ctx";

const ThreadsDataCtx = React.createContext<{
  threads: Result<Thread[]> | undefined;
  refetch: () => Promise<void>;
}>({
  threads: undefined,
  refetch: async () => {},
});

export const useThreadsData = () => React.useContext(ThreadsDataCtx);

export function ThreadsDataProvider({ children }: React.PropsWithChildren) {
  const at = useAnythreads();

  const [result, setResult] = React.useState<Result<Thread[]> | undefined>(undefined);

  const refetch = React.useCallback(async () => {
    if (!at) return;
    at.threads.findMany().then(setResult).catch(console.error);
  }, [at]);

  React.useEffect(() => {
    if (!at || !refetch) return;
    refetch();
  }, [at, refetch]);

  return (
    <ThreadsDataCtx.Provider
      value={{
        threads: result,
        refetch,
      }}
    >
      {children}
    </ThreadsDataCtx.Provider>
  );
}
