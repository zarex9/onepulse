import { NextRequest, NextResponse } from "next/server"
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  type ParseWebhookEvent,
} from "@farcaster/miniapp-node"

import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const requestJson = await request.json()
  // Parse and verify the webhook event (signed by client app key)
  let data: Awaited<ReturnType<typeof parseWebhookEvent>>
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar)
  } catch (e: unknown) {
    const err = e as ParseWebhookEvent.ErrorType
    // Map known verification errors to HTTP responses
    const name = err?.name
    if (
      name === "VerifyJsonFarcasterSignature.InvalidDataError" ||
      name === "VerifyJsonFarcasterSignature.InvalidEventDataError"
    ) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
    }
    if (name === "VerifyJsonFarcasterSignature.InvalidAppKeyError") {
      return NextResponse.json({ error: "invalid_app_key" }, { status: 401 })
    }
    if (name === "VerifyJsonFarcasterSignature.VerifyAppKeyError") {
      return NextResponse.json(
        { error: "verify_app_key_failed" },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "invalid_webhook" }, { status: 400 })
  }

  const fid = data.fid
  const appFid = data.appFid
  const event = data.event

  try {
    switch (event.event) {
      case "miniapp_added":
      case "notifications_enabled": {
        const details = event.notificationDetails
        if (details?.url && details?.token) {
          await prisma.notificationDetails.upsert({
            where: { fid_appFid: { fid: BigInt(fid), appFid } },
            update: { url: details.url, token: details.token },
            create: {
              fid: BigInt(fid),
              appFid,
              url: details.url,
              token: details.token,
            },
          })
        }
        break
      }
      case "notifications_disabled":
      case "miniapp_removed": {
        await prisma.notificationDetails.deleteMany({
          where: { fid: BigInt(fid), appFid },
        })
        break
      }
      default:
        break
    }
  } catch (e) {
    // Log and continue; ensure fast webhook return (<10s)
    console.error("webhook handling error", e)
  }

  return NextResponse.json({ ok: true })
}
