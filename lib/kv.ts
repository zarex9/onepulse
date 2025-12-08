import type { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function getUserNotificationDetailsKey(fid: number, appFid: number): string {
  return `onepulse:user:${appFid}:${fid}`;
}

export type UserShareData = {
  username: string;
  displayName: string;
  pfp?: string;
};

function getUserShareDataKey(address: string): string {
  return `onepulse:share:${address.toLowerCase()}`;
}

export async function getUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<MiniAppNotificationDetails | null> {
  return await redis.get<MiniAppNotificationDetails>(
    getUserNotificationDetailsKey(fid, appFid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  appFid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  await redis.set(
    getUserNotificationDetailsKey(fid, appFid),
    notificationDetails
  );
}

export async function deleteUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid, appFid));
}

export async function setUserShareData(
  address: string,
  data: UserShareData
): Promise<void> {
  await redis.set(getUserShareDataKey(address), data, { ex: 86_400 }); // 24 hour TTL
}

export async function getUserShareData(
  address: string
): Promise<UserShareData | null> {
  return await redis.get<UserShareData>(getUserShareDataKey(address));
}
