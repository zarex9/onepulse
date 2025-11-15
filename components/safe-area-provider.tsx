"use client";

import { SafeArea } from "@coinbase/onchainkit/minikit";
import type { ReactNode } from "react";

type SafeAreaProviderProps = {
  children: ReactNode;
};

export function SafeAreaProvider({ children }: SafeAreaProviderProps) {
  return <SafeArea>{children}</SafeArea>;
}
