// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProveedorAuth } from '@/context/AuthContext';
import { ReactNode, useState } from 'react';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <ProveedorAuth>
          {children}
      </ProveedorAuth>
    </QueryClientProvider>
  );
}
