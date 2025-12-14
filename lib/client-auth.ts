import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";

async function verifyFidWithQuickAuth(
  token: string | null
): Promise<number | undefined> {
  try {
    const response = await sdk.quickAuth.fetch("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    if (data.success && data.user?.fid) {
      return data.user.fid;
    }
  } catch {
    toast.error("Failed to verify FID");
  }
}

async function getToken(): Promise<string | null> {
  try {
    const { token } = await sdk.quickAuth.getToken();
    return token;
  } catch {
    return null;
  }
}

export async function signIn(): Promise<number | undefined> {
  try {
    const authJWT = await getToken();
    const verifiedFid = await verifyFidWithQuickAuth(authJWT);
    return verifiedFid;
  } catch (e) {
    console.error("Sign in failed", e);
    return;
  }
}
