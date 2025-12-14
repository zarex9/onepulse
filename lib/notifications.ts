import {
  type SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/miniapp-sdk";

import { handleError } from "@/lib/error-handling";
import { getUserNotificationDetails } from "@/lib/kv";

const appUrl = process.env.NEXT_PUBLIC_URL || "";

type sendMiniAppNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendMiniAppNotification({
  fid,
  appFid,
  title,
  body,
  notificationId,
}: {
  fid: number;
  appFid: number;
  title: string;
  body: string;
  notificationId?: string;
}): Promise<sendMiniAppNotificationResult> {
  let notificationDetails: Awaited<
    ReturnType<typeof getUserNotificationDetails>
  >;
  try {
    notificationDetails = await getUserNotificationDetails(fid, appFid);
  } catch (error) {
    handleError(
      error,
      "Failed to read notification details",
      { operation: "notifications/getUserNotificationDetails", fid, appFid },
      { silent: true }
    );
    return { state: "error", error };
  }
  if (!notificationDetails) {
    return { state: "no_token" };
  }

  let response: Response;
  let responseJson: unknown;
  try {
    response = await fetch(notificationDetails.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: notificationId ?? crypto.randomUUID(),
        title,
        body,
        targetUrl: appUrl,
        tokens: [notificationDetails.token],
      } satisfies SendNotificationRequest),
    });

    responseJson = await response.json();
  } catch (error) {
    handleError(
      error,
      "Failed to send notification",
      { operation: "notifications/fetch", fid, appFid },
      { silent: true }
    );
    return { state: "error", error };
  }

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (responseBody.success === false) {
      return { state: "error", error: responseBody.error.errors };
    }

    if (responseBody.data.result.rateLimitedTokens.length) {
      return { state: "rate_limit" };
    }

    return { state: "success" };
  }
  return { state: "error", error: responseJson };
}
