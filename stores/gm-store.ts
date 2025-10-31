/* eslint-disable @typescript-eslint/no-unused-vars */
import { DbConnection, GmStatsByAddress } from "@/lib/module_bindings"
import { getDbConnection } from "@/lib/spacetimedb/connection-factory"
import { onSubscriptionChange } from "@/lib/spacetimedb/subscription-events"

class GmStatsByAddressStore {
  private listeners: Set<() => void> = new Set()
  private connection: DbConnection | null = null
  private cachedSnapshot: GmStatsByAddress[] = []
  private serverSnapshot: GmStatsByAddress[] = []

  constructor() {
    onSubscriptionChange(() => {
      this.updateSnapshot()
    })
  }

  public subscribe(onStoreChange: () => void) {
    this.listeners.add(onStoreChange)
    return () => {
      // Cleanup on unmount
      this.listeners.delete(onStoreChange)
    }
  }

  public getSnapshot() {
    try {
      this.getConnection()
      return this.cachedSnapshot
    } catch (error) {
      const isNotSSR = typeof window !== "undefined"
      if (isNotSSR) {
        // This would be an unexpected error on the client-side
        console.error("Unexpected error while obtaining snapshot:", error)
      }
      return this.serverSnapshot
    }
  }

  public getServerSnapshot() {
    // Return the same reference to prevent unnecessary SSR re-renders
    return this.serverSnapshot
  }

  public reportGm(
    address: string,
    chainId: number,
    lastGmDay: number,
    txHash: string,
    fid: bigint,
    displayName: string,
    username: string
  ) {
    if (this.connection) {
      this.connection.reducers.reportGm(
        address,
        chainId,
        lastGmDay,
        txHash,
        fid,
        displayName,
        username
      )
    }
  }

  private getConnection(): DbConnection {
    if (!this.connection) {
      this.connection = getDbConnection()
      this.connection.db.gmStatsByAddress.onInsert((ctx, row) =>
        this.updateSnapshot()
      )
      this.connection.db.gmStatsByAddress.onDelete((ctx, row) =>
        this.updateSnapshot()
      )
    }
    return this.connection
  }

  private updateSnapshot() {
    if (this.connection) {
      this.cachedSnapshot = Array.from(
        this.connection.db.gmStatsByAddress.iter()
      )
      this.emitChange()
    }
  }

  private emitChange() {
    for (const listener of this.listeners) {
      listener()
    }
  }
}

export const gmStatsByAddressStore = new GmStatsByAddressStore()
