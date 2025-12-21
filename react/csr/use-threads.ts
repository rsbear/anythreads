// csr/use-threads.ts
import { useEffect, useState } from 'react';
import { useAnythreads } from './AnythreadsProvider';
import type { Thread, FindManyOptions } from '@anythreads/api/threads';

export function useThreads(options?: FindManyOptions) {
  const anythreads = useAnythreads();
  const [state, setState] = useState<{
    data: Thread[] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setState({ data: null, loading: true, error: null });
      
      const result = await anythreads.threads.findMany(options);
      
      if (cancelled) return;
      
      if (result.isOk) {
        setState({ data: result.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: result.err.msg });
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [anythreads, JSON.stringify(options)]); // Simple dependency tracking

  return state;
}
