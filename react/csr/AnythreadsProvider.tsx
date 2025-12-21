// csr/provider.tsx
import { createContext, useContext } from 'react';
import type { Anythreads } from '@anythreads/api';

const AnythreadsContext = createContext<Anythreads | null>(null);

export function AnythreadsProvider({ 
  value, 
  children 
}: { 
  value: Anythreads;
  children: React.ReactNode;
}) {
  return (
    <AnythreadsContext.Provider value={value}>
      {children}
    </AnythreadsContext.Provider>
  );
}

export function useAnythreads() {
  const ctx = useContext(AnythreadsContext);
  if (!ctx) throw new Error('useAnythreadsInstance must be used within AnythreadsProvider');
  return ctx;
}
