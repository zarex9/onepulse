import { type NextRequest, NextResponse } from "next/server";
import { verifyQuickAuth } from "@/lib/quick-auth";

export async function GET(request: NextRequest) {
  const result = await verifyQuickAuth(request);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      fid: result.fid,
      issuedAt: result.issuedAt,
      expiresAt: result.expiresAt,
    },
  });
}
