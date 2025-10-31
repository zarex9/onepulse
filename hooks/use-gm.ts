import { useSyncExternalStore } from "react"
import { gmStatsByAddressStore } from "@/stores/gm-store"

export function useMessages() {
  const gm = useSyncExternalStore(
    (callback) => gmStatsByAddressStore.subscribe(callback),
    () => gmStatsByAddressStore.getSnapshot(),
    () => gmStatsByAddressStore.getServerSnapshot()
  )
  return gm
}
