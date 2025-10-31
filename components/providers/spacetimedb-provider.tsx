"use client"

import { useEffect } from "react"

import {
  disconnectDbConnection,
  getDbConnection,
} from "@/lib/spacetimedb/connection-factory"

export const SpacetimeDBProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  useEffect(() => {
    getDbConnection()

    return () => {
      disconnectDbConnection()
    }
  }, [])

  // It doesn't need to render anything itself, just pass children through.
  return <>{children}</>
}
