"use client";

import { DbConnection } from "@/lib/module_bindings";
import { cleanupConnectionListener } from "@/lib/spacetimedb/connection-events";
import {
  onConnect,
  onConnectError,
  onDisconnect,
} from "@/lib/spacetimedb/connection-handlers";
import { cleanupSubscriptionListener } from "@/lib/spacetimedb/subscription-events";

let singletonConnection: DbConnection | null = null;

export const getDbConnection = (): DbConnection => {
  const isSSR = typeof window === "undefined";
  if (isSSR) {
    throw new Error("Cannot use SpacetimeDB on the server.");
  }

  if (singletonConnection) {
    return singletonConnection;
  }

  singletonConnection = buildDbConnection();
  return singletonConnection;
};

const buildDbConnection = () => {
  const uri =
    process.env.SPACETIMEDB_HOST ||
    process.env.SPACETIMEDB_HOST_URL ||
    "ws://127.0.0.1:3000";
  const moduleName = process.env.SPACETIMEDB_MODULE || "onepulse";
  const token = getAuthToken();
  const builder = DbConnection.builder()
    .withUri(uri)
    .withModuleName(moduleName)
    .onConnect(onConnect)
    .onDisconnect(onDisconnect)
    .onConnectError(onConnectError);

  if (token) builder.withToken(token);

  return builder.build();
};

const getAuthToken = () => process.env.SPACETIMEDB_TOKEN || "";

export const disconnectDbConnection = () => {
  if (singletonConnection) {
    singletonConnection.disconnect();
    singletonConnection = null;
  }
  cleanupConnectionListener();
  cleanupSubscriptionListener();
};
