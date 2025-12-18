import { type NextRequest, NextResponse } from "next/server";
import {
  type Chain,
  createPublicClient,
  createWalletClient,
  encodePacked,
  http,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, celo, optimism } from "viem/chains";
import { z } from "zod";

import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { getDailyRewardsV2Address } from "@/lib/utils";

const BACKEND_SIGNER_PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY;

if (!BACKEND_SIGNER_PRIVATE_KEY) {
  console.warn("BACKEND_SIGNER_PRIVATE_KEY not configured");
}

const claimExecuteRequestSchema = z.object({
  claimer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fid: z.number().int().positive(),
  deadline: z.number().int().positive(),
  chainId: z.number().int().positive(),
});

/**
 * Generates a backend-signed authorization for a claim with nonce.
 * The user receives this signature and submits it with their own transaction.
 */
async function generateClaimAuthorization(params: {
  claimer: string;
  fid: number | bigint;
  deadline: number | bigint;
  chainId: number;
}) {
  const account = privateKeyToAccount(
    BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`
  );

  // Select the correct chain based on chainId
  const chainMap: Record<number, Chain> = {
    [BASE_CHAIN_ID]: base,
    [CELO_CHAIN_ID]: celo,
    [OPTIMISM_CHAIN_ID]: optimism,
  };

  const chain = chainMap[params.chainId] ?? base;

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const contractAddress = getDailyRewardsV2Address(params.chainId);

  if (!contractAddress) {
    throw new Error("Contract address not configured");
  }

  const nonce = await publicClient.readContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsV2Abi,
    functionName: "nonces",
    args: [params.claimer as `0x${string}`],
  });

  // Create message hash matching the contract's format with nonce:
  // keccak256(abi.encodePacked(claimer, fid, nonce, deadline, address(this)))
  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "uint256", "address"],
      [
        params.claimer as `0x${string}`,
        BigInt(params.fid),
        BigInt(nonce.toString()),
        BigInt(params.deadline),
        contractAddress as `0x${string}`,
      ]
    )
  );

  const signature = await walletClient.signMessage({
    message: { raw: messageHash },
  });

  return {
    signature,
    nonce: Number(nonce),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = claimExecuteRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { claimer, fid, deadline, chainId } = parseResult.data;

    const authResult = await generateClaimAuthorization({
      claimer,
      fid,
      deadline,
      chainId,
    });

    return NextResponse.json({
      signature: authResult.signature,
      nonce: authResult.nonce,
      message: "Claim authorization generated successfully",
    });
  } catch (error) {
    // Claim authorization generation failed - returning error response
    return NextResponse.json(
      {
        error: "Failed to generate claim authorization",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
