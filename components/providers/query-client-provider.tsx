"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useQueryClientProviderLogic } from "./use-query-client-provider-logic";

export default function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { queryClient, persister } = useQueryClientProviderLogic();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
