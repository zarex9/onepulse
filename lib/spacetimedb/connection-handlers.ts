import { ErrorContextInterface, Identity } from "spacetimedb"

import {
  DbConnection,
  RemoteReducers,
  RemoteTables,
  SetReducerFlags,
  type ErrorContext,
} from "@/lib/module_bindings"
import {
  connectionStatus,
  notifyConnectionDisconnected,
  notifyConnectionError,
  notifyConnectionEstablished,
} from "@/lib/spacetimedb/connection-events"
import {
  notifySubscriptionApplied,
  notifySubscriptionError,
} from "@/lib/spacetimedb/subscription-events"

export const onConnect = (
  conn: DbConnection,
  identity: Identity,
  token: string
) => {
  console.log("[SpacetimeDB] Connection established.")
  connectionStatus.isConnected = true
  connectionStatus.error = null
  connectionStatus.identity = identity
  localStorage.setItem("auth_token", token)

  notifyConnectionEstablished()
  subscribeToQueries(conn, ["SELECT * FROM gm_stats_by_address"])
}

export const onDisconnect = () => {
  console.warn("[SpacetimeDB] Disconnected.")
  connectionStatus.isConnected = false
  connectionStatus.isSubscribed = false
  notifyConnectionDisconnected()
}

export const onConnectError = (ctx: ErrorContext, error: Error) => {
  console.error("[SpacetimeDB] Connection Error:", error)
  connectionStatus.isConnected = false
  connectionStatus.isSubscribed = false
  connectionStatus.error = error
  notifyConnectionError()
}

export const subscribeToQueries = (conn: DbConnection, queries: string[]) => {
  conn
    ?.subscriptionBuilder()
    .onApplied(() => {
      console.log("[SpacetimeDB] Subscribed to queries.")
      connectionStatus.isSubscribed = true
      notifySubscriptionApplied()
    })
    .onError(
      (
        ctx: ErrorContextInterface<
          RemoteTables,
          RemoteReducers,
          SetReducerFlags
        >
      ) => {
        console.error(
          "[SpacetimeDB] Error subscribing to SpacetimeDB " + ctx.event
        )
        connectionStatus.isSubscribed = false
        notifySubscriptionError()
      }
    )
    .subscribe(queries)
}
