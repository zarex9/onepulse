import { useAppKit, useDisconnect } from "@reown/appkit/react"
import { type VariantProps } from "class-variance-authority"
import { Unplug } from "lucide-react"

import { Button, type buttonVariants } from "@/components/ui/button"

type ButtonSize = VariantProps<typeof buttonVariants>["size"]
function ConnectWallet({
  size = "default" as ButtonSize,
  className,
}: {
  size?: ButtonSize
  className?: string
}) {
  const { open } = useAppKit()

  return (
    <Button
      size={size}
      className={className}
      onClick={() => open({ view: "Connect", namespace: "eip155" })}
    >
      Connect Wallet
    </Button>
  )
}

function DisconnectWallet({ onDisconnected }: { onDisconnected?: () => void }) {
  const { disconnect } = useDisconnect()

  return (
    <Button
      variant="outline"
      className="w-full"
      aria-label="Disconnect wallet"
      onClick={async () => {
        await disconnect({ namespace: "eip155" })
        onDisconnected?.()
      }}
    >
      <Unplug className="mr-2 h-4 w-4" /> Disconnect Wallet
    </Button>
  )
}

export { ConnectWallet, DisconnectWallet }
