"use client";

import { QueryClientProvider as Provider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/client";

export default function QueryClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = getQueryClient();

  return <Provider client={queryClient}>{children}</Provider>;
}
