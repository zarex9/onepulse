import { prisma } from "@/lib/prisma"

export type SendNotificationRequest = {
  notificationId?: string
  title: string
  body: string
  targetUrl: string
}

export type SendNotificationResult = {
  successfulTokens: string[]
  invalidTokens: string[]
  rateLimitedTokens: string[]
}

/**
 * Send a Mini App notification to a specific (fid, appFid) pair using the stored token+url.
 * Automatically cleans up invalid tokens on 400 responses from the client.
 */
export async function sendMiniAppNotification(
  fid: bigint,
  appFid: number,
  payload: SendNotificationRequest
): Promise<SendNotificationResult | null> {
  const clamp = (s: string, max: number) =>
    s.length > max ? s.slice(0, max) : s
  const details = await prisma.notificationDetails.findUnique({
    where: { fid_appFid: { fid, appFid } },
  })

  if (!details) return null

  const notificationId = clamp(
    payload.notificationId || crypto.randomUUID().toString(),
    128
  )

  const res = await fetch(details.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      notificationId,
      title: clamp(payload.title, 32),
      body: clamp(payload.body, 128),
      targetUrl: clamp(payload.targetUrl, 1024),
      tokens: [details.token],
    }),
  })

  // If the server rejects the token, remove it to avoid future attempts
  if (!res.ok) {
    if (res.status === 400) {
      await prisma.notificationDetails.delete({
        where: { fid_appFid: { fid, appFid } },
      })
    }
    return {
      successfulTokens: [],
      invalidTokens: [details.token],
      rateLimitedTokens: [],
    }
  }

  const json = (await res.json()) as SendNotificationResult

  if (json.invalidTokens?.length) {
    // If token is invalidated, clean it up
    await prisma.notificationDetails.delete({
      where: { fid_appFid: { fid, appFid } },
    })
  }

  await prisma.notificationDetails
    .update({
      where: { fid_appFid: { fid, appFid } },
      data: { lastNotifiedAt: new Date() },
    })
    .catch(() => {})

  return json
}

/**
 * Send the same notification to all clients (distinct appFid rows) of a given fid.
 */
export async function sendNotificationToAllClients(
  fid: bigint,
  payload: SendNotificationRequest
): Promise<Record<number, SendNotificationResult | null>> {
  const rows = await prisma.notificationDetails.findMany({ where: { fid } })
  type NotificationRow = (typeof rows)[number]
  const results: Record<number, SendNotificationResult | null> = {}

  await Promise.all(
    rows.map(async (row: NotificationRow) => {
      results[row.appFid] = await sendMiniAppNotification(
        fid,
        row.appFid,
        payload
      )
    })
  )

  return results
}
