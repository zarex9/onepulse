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
  }
}

type ValidationFailure = {
  valid: false
  missing: string[]
}

function validateRequest(
  body: Record<string, unknown>
): ValidationSuccess | ValidationFailure {
  const { claimer, fid, deadline } = body
  const missing = []

  if (!claimer) missing.push("claimer")
  if (!fid) missing.push("fid")
  if (!deadline) missing.push("deadline")

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return {
    valid: true,
    data: {
      claimer: claimer as string,
      fid: fid as number | bigint,
      deadline: deadline as number | bigint,
    },
  }
}

async function executeGaslessClaim(params: {
  claimer: string
  fid: number | bigint
  deadline: number | bigint
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

  // Read the user's current nonce from the contract
  const userInfo = await publicClient.readContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsAbi,
    functionName: "userInfo",
    args: [params.claimer as `0x${string}`],
  })

  // userInfo returns [lastClaimDay, nonce]
  const nonce = userInfo[1]

  // Generate signature using the operator's private key
  // The signature is for the claimer's address, not the operator
  const domain = {
    name: "DailyRewards",
    version: "1",
    chainId: base.id,
    verifyingContract: contractAddress as `0x${string}`,
  }

  const types = {
    Claim: [
      { name: "claimer", type: "address" },
      { name: "fid", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  }

  const message = {
    claimer: params.claimer as `0x${string}`,
    fid: BigInt(params.fid),
    deadline: BigInt(params.deadline),
    nonce: BigInt(nonce),
  }

  // Sign with the operator's private key
  const signature = await walletClient.signTypedData({
    account,
    domain,
    types,
    primaryType: "Claim",
    message,
  })

  // Execute the gasless claim with the operator's signature
  const hash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsAbi,
    functionName: "executeGaslessClaim",
    args: [
      params.claimer as `0x${string}`,
      BigInt(params.fid),
      BigInt(params.deadline),
      signature,
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
