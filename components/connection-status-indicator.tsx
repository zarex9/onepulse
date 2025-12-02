"use client";

import { useConnectionStatusLogic } from "./connection-status-indicator/use-connection-status-logic";

/**
 * Component to display SpacetimeDB connection status and reconnection state.
 * This demonstrates the RES-004 automatic reconnection feature.
 */
export function ConnectionStatusIndicator() {
  const { connection, statusInfo } = useConnectionStatusLogic();

  return (
    <div className="fixed right-4 bottom-4 rounded-lg border bg-background p-4 shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${statusInfo.className}`} />
          <span className="font-medium text-sm">{statusInfo.text}</span>
        </div>

        {connection.isReconnecting && (
          <div className="text-muted-foreground text-xs">
            Attempt {connection.reconnectAttempts}
          </div>
        )}

        {connection.isSubscribed && (
          <div className="text-green-600 text-xs">✓ Subscribed</div>
        )}

        {connection.error && (
          <div className="text-red-600 text-xs">
            Error: {connection.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
