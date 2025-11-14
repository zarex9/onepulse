"use client";

import type { ReactNode } from "react";
import { SpacetimeDBProvider as Provider } from "spacetimedb/react";
import { getConnectionBuilder } from "@/lib/spacetimedb/connection-factory";

export const SpacetimeDBProvider = ({ children }: { children: ReactNode }) => {
  const connectionBuilder = getConnectionBuilder();

  return <Provider connectionBuilder={connectionBuilder}>{children}</Provider>;
};
