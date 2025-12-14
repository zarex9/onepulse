import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { handleError } from "@/lib/error-handling";
import { setUserShareData } from "@/lib/kv";

const shareUserRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.object({
    username: z.string().min(1),
    displayName: z.string().min(1),
    pfp: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = shareUserRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    await setUserShareData(parsed.data.address, parsed.data.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    handleError(
      error,
      "Failed to store share user data",
      { operation: "share/user" },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to store share user data" },
      { status: 500 }
    );
  }
}
