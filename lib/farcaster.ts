import { handleError } from "@/lib/error-handling";

export async function fetchPrimaryWallet(fid: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      return null;
    }
    const json = await response.json();

    // Response structure: { result: { address: { fid, protocol, address } } }
    return json.result?.address?.address || null;
  } catch (error) {
    handleError(
      error,
      "Failed to fetch primary wallet",
      {
        operation: "farcaster/fetch-primary-wallet",
        fid,
      },
      { silent: true }
    );
    return null;
  }
}
