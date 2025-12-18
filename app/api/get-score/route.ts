import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getScore } from "@/lib/neynar";

export const dynamic = "force-dynamic";

const getScoreQuerySchema = z
  .object({
    fid: z.string().nullish(),
  })
  .transform((val) => ({
    fid: val.fid ? Number(val.fid) : null,
  }))
  .refine((val) => val.fid !== null && val.fid > 0, {
    message: "fid must be a positive integer",
  });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = getScoreQuerySchema.safeParse({
      fid: searchParams.get("fid"),
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message ?? "Invalid parameters" },
        { status: 400 }
      );
    }

    if (parseResult.data.fid === null) {
      return NextResponse.json(
        { error: "Missing required parameter: fid" },
        { status: 400 }
      );
    }

    const follows = await getScore([parseResult.data.fid]);

    return NextResponse.json(follows);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
