"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { useIsInMiniApp, useMiniKit } from "@coinbase/onchainkit/minikit"

export type MiniAppNotificationDetails = {
  url: string
  token: string
}
export type MiniAppPlatformType = "web" | "mobile"
export type MiniAppUser = {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
}
export interface MiniAppCast {
  author: MiniAppUser
  hash: string
  parentHash?: string
  parentFid?: number
  timestamp?: number
  mentions?: MiniAppUser[]
  text: string
  embeds?: string[]
  channelKey?: string
}
export type CastEmbedLocationContext = {
  type: "cast_embed"
  embed: string
  cast: MiniAppCast
}
export type CastShareLocationContext = {
  type: "cast_share"
  cast: MiniAppCast
}
export type NotificationLocationContext = {
  type: "notification"
  notification: {
    notificationId: string
    title: string
    body: string
  }
}
export type LauncherLocationContext = {
  type: "launcher"
}
export type ChannelLocationContext = {
  type: "channel"
  channel: {
    key: string
    name: string
    imageUrl?: string
  }
}
export type OpenMiniAppLocationContext = {
  type: "open_miniapp"
  referrerDomain: string
}
export type LocationContext =
  | CastEmbedLocationContext
  | CastShareLocationContext
  | NotificationLocationContext
  | LauncherLocationContext
  | ChannelLocationContext
  | OpenMiniAppLocationContext
export type AccountLocation = {
  placeId: string
  description: string
}
export type UserContext = {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
  location?: AccountLocation
}
export type SafeAreaInsets = {
  top: number
  bottom: number
  left: number
  right: number
}
export type ClientContext = {
  platformType?: MiniAppPlatformType
  clientFid: number
  added: boolean
  notificationDetails?: MiniAppNotificationDetails
  safeAreaInsets?: SafeAreaInsets
}
export type ClientFeatures = {
  haptics: boolean
  cameraAndMicrophoneAccess?: boolean
}
export type MiniAppContext = {
  client: ClientContext
  user: UserContext
  location?: LocationContext
  features?: ClientFeatures
}

type MiniAppContextType = {
  context: MiniAppContext | null
  isInMiniApp: boolean
} | null

const MiniAppContext = createContext<MiniAppContextType>(null)

export const useMiniAppContext = () => useContext(MiniAppContext)

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [miniAppContext, setMiniAppContext] = useState<MiniAppContextType>(null)
  const { context } = useMiniKit()
  const { isInMiniApp } = useIsInMiniApp()

  useEffect(() => {
    const init = async () => {
      try {
        // Small delay to ensure context is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 100))

        setMiniAppContext({
          context: context,
          isInMiniApp: isInMiniApp ?? false,
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setMiniAppContext({
          context: null,
          isInMiniApp: false,
        })
      }
    }

    init()
  }, [context, isInMiniApp])

  return (
    <MiniAppContext.Provider value={miniAppContext}>
      {children}
    </MiniAppContext.Provider>
  )
}
