import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/error-handling";
import { checkRateLimit, getDailyClaimsCount } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Extract IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit: 60 requests per minute per IP
  // This is a public stats endpoint, so we allow reasonable polling frequency
  try {
    const { allowed } = await checkRateLimit(`ip:claims-stats:${ip}`, 60, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  } catch (error) {
    handleError(
      error,
      "Rate limit check failed",
      { operation: "claims/stats/rateLimit", ip },
      { silent: true }
    );
    // On rate limit check failure, fail open (allow request to proceed)
    // to avoid breaking the endpoint due to KV issues
  }

  try {
    const count = await getDailyClaimsCount();
    const response = NextResponse.json({ count });
    // Cache in CDN for 10 seconds, but browsers revalidate immediately
    response.headers.set("Cache-Control", "public, s-maxage=10, max-age=0");
    return response;
  } catch (error) {
    handleError(
      error,
      "Error fetching claim stats",
      {
        operation: "claims/stats",
      },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to fetch claim stats" },
      { status: 500 }
    );
  }
}
