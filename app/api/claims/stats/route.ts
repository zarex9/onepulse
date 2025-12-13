import { NextResponse } from "next/server";
import { getDailyClaimsCount } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getDailyClaimsCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch claim stats" },
      { status: 500 }
    );
  }
}
