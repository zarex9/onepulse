"use client";

import type { ReactNode } from "react";
import type { Identity } from "spacetimedb";
import { SpacetimeDBProvider as Provider } from "spacetimedb/react";
import { DbConnection, type ErrorContext } from "@/spacetimedb";

const HOST = process.env.SPACETIMEDB_HOST ?? "wss://maincloud.spacetimedb.com";
const MODULE = process.env.SPACETIMEDB_MODULE ?? "onepulse-v2";

// Validate required environment variables
if (!HOST) {
  throw new Error("SPACETIMEDB_HOST is not defined");
}

if (!MODULE) {
  throw new Error("SPACETIMEDB_MODULE is not defined");
}

function getToken(): string | undefined {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return undefined;
  }
  return localStorage.getItem("auth_token") ?? undefined;
}

function setToken(token: string): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem("auth_token", token);
}

function onConnect(
  conn: DbConnection,
  _identity: Identity,
  token: string
): void {
  setToken(token);
  conn.reducers.onReport(() => {
    // Report successfully sent
  });
}

function onDisconnect(): void {
  // Connection closed
}

function onConnectError(_ctx: ErrorContext, err: Error): void {
  // Log error for monitoring, but don't throw in production
  if (process.env.NODE_ENV === "development") {
    console.error("SpacetimeDB connection error:", err);
  }
}

const connectionBuilder = DbConnection.builder()
  .withUri(HOST)
  .withModuleName(MODULE)
  .withToken(getToken())
  .onConnect(onConnect)
  .onDisconnect(onDisconnect)
  .onConnectError(onConnectError);

type SpacetimeDBProviderProps = {
  children: ReactNode;
};

export function SpacetimeDBProvider({ children }: SpacetimeDBProviderProps) {
  return <Provider connectionBuilder={connectionBuilder}>{children}</Provider>;
}
