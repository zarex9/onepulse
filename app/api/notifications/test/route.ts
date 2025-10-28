import { NextRequest, NextResponse } from "next/server"
import { minikitConfig } from "@/minikit.config"

import { sendMiniAppNotification } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization")
  const secret = process.env.NOTIFY_TEST_SECRET
  if (!secret || !auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const json = (await req.json()) as {
    fid: number | string
    appFid: number | string
    title?: string
    body?: string
    targetUrl?: string
  }

  const fidNum = BigInt(json.fid)
  const appFidNum = Number(json.appFid)
  if (!fidNum || !appFidNum) {
    return NextResponse.json({ error: "missing fid/appFid" }, { status: 400 })
  }

  const title = json.title ?? "Test Notification"
  const body = json.body ?? "Hello from OnePulse"
  const targetUrl = json.targetUrl ?? minikitConfig.miniapp.homeUrl

  const result = await sendMiniAppNotification(fidNum, appFidNum, {
    title,
    body,
    targetUrl,
  })

  if (!result) {
    return NextResponse.json({ error: "no_token_for_pair" }, { status: 404 })
  }

  return NextResponse.json(result)
}
