"use client";

import type { ReactNode } from "react";
import { SpacetimeDBProvider as Provider } from "spacetimedb/react";
import { useSpacetimeDBProviderLogic } from "./use-spacetimedb-provider-logic";

export const SpacetimeDBProvider = ({ children }: { children: ReactNode }) => {
  const { connectionBuilder } = useSpacetimeDBProviderLogic();

  // Render children without provider until connection builder is ready
  if (!connectionBuilder) {
    return <>{children}</>;
  }

  return <Provider connectionBuilder={connectionBuilder}>{children}</Provider>;
};
