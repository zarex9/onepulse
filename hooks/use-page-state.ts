import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

import { detectCoinbaseSmartWallet } from "@/lib/utils"
import { useMiniAppContext } from "@/components/providers/miniapp-provider"

export function usePageState() {
  const { address, isConnected } = useAccount()
  const [isSmartWallet, setIsSmartWallet] = useState(false)
  const miniAppContextData = useMiniAppContext()
  const inMiniApp = miniAppContextData?.isInMiniApp ?? false

  useEffect(() => {
    if (!isConnected || !address) return
    ;(async () => {
      const result = await detectCoinbaseSmartWallet(address as `0x${string}`)
      setIsSmartWallet(result)
    })()
  }, [isConnected, address])

  return { isSmartWallet, inMiniApp, isConnected, address }
}
