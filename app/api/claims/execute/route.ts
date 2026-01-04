import { http } from "@wagmi/core";
import { base } from "@wagmi/core/chains";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "viem";
import { type Address, privateKeyToAccount } from "viem/accounts";
import { readContract } from "viem/actions";
import { encodePacked, keccak256 } from "viem/utils";
import { z } from "zod";
import { dailyRewardsV2Abi, dailyRewardsV2Address } from "@/helpers/contracts";
import { BASE_CHAIN_ID, type ChainId } from "@/lib/constants";

const BACKEND_SIGNER_PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY;

if (!BACKEND_SIGNER_PRIVATE_KEY) {
  console.warn("BACKEND_SIGNER_PRIVATE_KEY not configured");
}

const claimExecuteRequestSchema = z.object({
  claimer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fid: z.number().int().positive(),
  deadline: z.number().int().positive(),
  chainId: z.literal(BASE_CHAIN_ID),
});

const account = privateKeyToAccount(
  BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`
);

/**
 * Generates a backend-signed authorization for a claim with nonce.
 * The user receives this signature and submits it with their own transaction.
 */
async function generateClaimAuthorization(params: {
  claimer: string;
  fid: number | bigint;
  deadline: number | bigint;
  chainId: ChainId;
}) {
  const client = createClient({
    chain: base,
    transport: http(),
  });

  const contractAddress = dailyRewardsV2Address[params.chainId];

  if (!contractAddress) {
    throw new Error("Contract address not configured");
  }

  const nonce = await readContract(client, {
    address: contractAddress as Address,
    abi: dailyRewardsV2Abi,
    functionName: "nonces",
    args: [params.claimer as Address],
  });

  // Create message hash matching the contract's format with nonce:
  // keccak256(abi.encodePacked(claimer, fid, nonce, deadline, address(this)))
  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "uint256", "address"],
      [
        params.claimer as Address,
        BigInt(params.fid),
        BigInt(nonce.toString()),
        BigInt(params.deadline),
        contractAddress as Address,
      ]
    )
  );

  const signature = await account.signMessage({
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
      chainId: chainId as ChainId,
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
