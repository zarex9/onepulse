"use client"

import { DbConnection } from "@/lib/module_bindings"
import { cleanupConnectionListener } from "@/lib/spacetimedb/connection-events"
import {
  onConnect,
  onConnectError,
  onDisconnect,
} from "@/lib/spacetimedb/connection-handlers"
import { cleanupSubscriptionListener } from "@/lib/spacetimedb/subscription-events"

let singletonConnection: DbConnection | null = null

export const getDbConnection = (): DbConnection => {
  const isSSR = typeof window === "undefined"
  if (isSSR) {
    throw new Error("Cannot use SpacetimeDB on the server.")
  }

  if (singletonConnection) {
    return singletonConnection
  }

  singletonConnection = buildDbConnection()
  return singletonConnection
}

const buildDbConnection = () => {
  const uri = process.env.SPACETIMEDB_HOST_URL || "ws://127.0.0.1:3000"
  const moduleName = process.env.SPACETIMEDB_MODULE || "onepulse"
  console.log("[SpacetimeDB] Building connection...")
  return DbConnection.builder()
    .withUri(uri)
    .withModuleName(moduleName)
    .withToken(getAuthToken())
    .onConnect(onConnect)
    .onDisconnect(onDisconnect)
    .onConnectError(onConnectError)
    .build()
}

const getAuthToken = () => {
  return ""
}

export const disconnectDbConnection = () => {
  if (singletonConnection) {
    console.log("[SpacetimeDB] Disconnecting...")
    singletonConnection.disconnect()
    singletonConnection = null
  }
  cleanupConnectionListener()
  cleanupSubscriptionListener()
}
