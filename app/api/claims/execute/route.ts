import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { getDailyRewardsAddress } from "@/lib/constants"

const GASLESS_OPERATOR_PRIVATE_KEY = process.env.GASLESS_OPERATOR_PRIVATE_KEY

if (!GASLESS_OPERATOR_PRIVATE_KEY) {
  console.warn("GASLESS_OPERATOR_PRIVATE_KEY not configured")
}

type ValidationSuccess = {
  valid: true
  data: {
    claimer: string
    fid: number | bigint
    deadline: number | bigint
    signature: string
  }
}

type ValidationFailure = {
  valid: false
  missing: string[]
}

function validateRequest(
  body: Record<string, unknown>
): ValidationSuccess | ValidationFailure {
  const { claimer, fid, deadline, signature } = body
  const missing = []

  if (!claimer) missing.push("claimer")
  if (!fid) missing.push("fid")
  if (!deadline) missing.push("deadline")
  if (!signature) missing.push("signature")

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return {
    valid: true,
    data: {
      claimer: claimer as string,
      fid: fid as number | bigint,
      deadline: deadline as number | bigint,
      signature: signature as string,
    },
  }
}

async function executeGaslessClaim(params: {
  claimer: string
  fid: number | bigint
  deadline: number | bigint
  signature: string
}) {
  const account = privateKeyToAccount(
    GASLESS_OPERATOR_PRIVATE_KEY as `0x${string}`
  )

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  })

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  })

  const contractAddress = getDailyRewardsAddress(base.id)

  if (!contractAddress) {
    throw new Error("Contract address not configured")
  }

  const hash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsAbi,
    functionName: "executeGaslessClaim",
    args: [
      params.claimer as `0x${string}`,
      BigInt(params.fid),
      BigInt(params.deadline),
      params.signature as `0x${string}`,
    ],
  })

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
  })

  return { hash, status: receipt.status }
}

export async function POST(req: NextRequest) {
  try {
    if (!GASLESS_OPERATOR_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Gasless operator not configured" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const validation = validateRequest(body)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          missing: validation.missing,
        },
        { status: 400 }
      )
    }

    const result = await executeGaslessClaim(validation.data)

    return NextResponse.json({
      success: true,
      txHash: result.hash,
      status: result.status,
    })
  } catch (error: unknown) {
    console.error("Gasless claim execution error:", error)

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error as { shortMessage?: string; details?: string }

    return NextResponse.json(
      {
        error: "Failed to execute claim",
        message: errorMessage,
        details:
          errorDetails?.shortMessage || errorDetails?.details || undefined,
      },
      { status: 500 }
    )
  }
}
