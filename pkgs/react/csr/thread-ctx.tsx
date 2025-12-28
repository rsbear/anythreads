import type { Result } from "@anythreads/api/result";
import type { ThreadComplete } from "@anythreads/api/threads";
import type { Vote } from "@anythreads/api/votes";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAnythreads } from "./anythreads-ctx";
import { useCurrentAccount } from "./current-account";

const ThreadDataCtx = createContext<{
  thread: Result<ThreadComplete> | undefined;
  pickAsync: (id: string) => Promise<void>;
}>({
  thread: undefined,
  pickAsync: async (_id: string) => { },
});

export const useThreadData = () => {
  const state = useContext(ThreadDataCtx);
  if (!state) {
    throw new Error("useThreadCtx must be used within a ThreadProvider");
  }
  return state;
};

export function ThreadDataProvider({ children }: PropsWithChildren) {
  const at = useAnythreads();

  const [result, setResult] = useState<Result<ThreadComplete> | undefined>(undefined);

  const pickAsync = useCallback(
    async (id: string) => {
      if (!at) return;
      const res = await at.threads.complete(id);
      console.log("pickAsync", res);
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
      <ThreadVotesProvider threadId={result?.value?.thread.id}>{children}</ThreadVotesProvider>
    </ThreadDataCtx.Provider>
  );
}

// ---- ThreadVotes

type ThreadVotesResult = Result<Record<string, Partial<Vote>>>;

const ThreadVotesCtx = createContext<ThreadVotesResult | undefined>(undefined);

export function useThreadVotes() {
  const ctx = useContext(ThreadVotesCtx);
  if (!ctx) {
    throw new Error("useThreadVotes must be used within a ThreadVotesProvider");
  }
  return ctx;
}

function ThreadVotesProvider({
  children,
  threadId,
}: PropsWithChildren<{ threadId: string | undefined }>) {
  const [result, setResult] = useState<ThreadVotesResult | undefined>(undefined);

  const at = useAnythreads();
  const currentAccountUser = useCurrentAccount();

  useEffect(() => {
    if (!at) {
      console.error("useThreadVotesProvider: at is undefined");
      return;
    }

    if (currentAccountUser.isErr) {
      console.error("useThreadVotesProvider: currentAccountUser isErr", currentAccountUser.err);
      return;
    }

    if (!threadId) {
      console.error("useThreadVotesProvider: props.threadId:", threadId);
      return;
    }

    at.votes
      .threadUser({
        accountId: currentAccountUser.value.id,
        threadId,
      })
      .then(setResult as any)
      .catch(console.error);
  }, [currentAccountUser, at, threadId]);

  return <ThreadVotesCtx.Provider value={result}>{children}</ThreadVotesCtx.Provider>;
}
