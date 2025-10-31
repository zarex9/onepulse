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
  connectionStatus.isConnected = true
  connectionStatus.error = null
  connectionStatus.identity = identity
  localStorage.setItem("auth_token", token)

  notifyConnectionEstablished()
  subscribeToQueries(conn, ["SELECT * FROM gm_stats_by_address"])
}

export const onDisconnect = () => {
  connectionStatus.isConnected = false
  connectionStatus.isSubscribed = false
  notifyConnectionDisconnected()
}

export const onConnectError = (_ctx: ErrorContext, error: Error) => {
  void _ctx
  connectionStatus.isConnected = false
  connectionStatus.isSubscribed = false
  connectionStatus.error = error
  notifyConnectionError()
}

export const subscribeToQueries = (conn: DbConnection, queries: string[]) => {
  conn
    ?.subscriptionBuilder()
    .onApplied(() => {
      connectionStatus.isSubscribed = true
      notifySubscriptionApplied()
    })
    .onError(
      (
        _ctx: ErrorContextInterface<
          RemoteTables,
          RemoteReducers,
          SetReducerFlags
        >
      ) => {
        void _ctx
        connectionStatus.isSubscribed = false
        notifySubscriptionError()
      }
    )
    .subscribe(queries)
}
