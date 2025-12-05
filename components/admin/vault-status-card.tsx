"use client";

import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { base } from "viem/chains";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";

type VaultStatus = {
  currentBalance: bigint;
  minReserve: bigint;
  availableForClaims: bigint;
};

type VaultStatusCardProps = {
  vaultStatus?: VaultStatus;
  contractAddress: `0x${string}`;
  onRefetchAction: () => void;
};

export function VaultStatusCard({
  vaultStatus,
  contractAddress,
  onRefetchAction,
}: VaultStatusCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositPending,
  } = useWriteContract();
  const {
    writeContract: withdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
  } = useWriteContract();

  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  const isDepositing = isDepositPending || isDepositConfirming;
  const isWithdrawing = isWithdrawPending || isWithdrawConfirming;

  const handleDeposit = () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    deposit(
      {
        address: contractAddress,
        abi: dailyRewardsAbi,
        functionName: "deposit",
        args: [parseEther(depositAmount)],
        chainId: base.id,
      },
      {
        onSuccess: () => {
          toast.success("Deposit transaction submitted");
          setDepositAmount("");
          onRefetchAction();
        },
        onError: (error) => {
          toast.error(error.message || "Deposit failed");
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    withdraw(
      {
        address: contractAddress,
        abi: dailyRewardsAbi,
        functionName: "emergencyWithdraw",
        args: [parseEther(withdrawAmount)],
        chainId: base.id,
      },
      {
        onSuccess: () => {
          toast.success("Withdraw transaction submitted");
          setWithdrawAmount("");
          onRefetchAction();
        },
        onError: (error) => {
          toast.error(error.message || "Withdraw failed");
        },
      }
    );
  };

  const formatDegen = (value?: bigint) => {
    if (value === undefined) {
      return "—";
    }
    return `${Number(formatEther(value)).toLocaleString()} DEGEN`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5" />
          Vault Status
        </CardTitle>
        <CardDescription>
          Monitor and manage the DEGEN token vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Current Balance
            </div>
            <div className="font-bold text-lg">
              {formatDegen(vaultStatus?.currentBalance)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Minimum Reserve
            </div>
            <div className="font-bold text-lg">
              {formatDegen(vaultStatus?.minReserve)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Available for Claims
            </div>
            <div className="font-bold text-green-600 text-lg dark:text-green-400">
              {formatDegen(vaultStatus?.availableForClaims)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deposit">Deposit DEGEN</Label>
            <div className="flex gap-2">
              <Input
                id="deposit"
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                value={depositAmount}
              />
              <Button
                disabled={isDepositing || !depositAmount}
                onClick={handleDeposit}
              >
                <ArrowUpCircle className="size-4" />
                {isDepositing ? "..." : "Deposit"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw">Emergency Withdraw</Label>
            <div className="flex gap-2">
              <Input
                id="withdraw"
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                value={withdrawAmount}
              />
              <Button
                disabled={isWithdrawing || !withdrawAmount}
                onClick={handleWithdraw}
                variant="destructive"
              >
                <ArrowDownCircle className="size-4" />
                {isWithdrawing ? "..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
