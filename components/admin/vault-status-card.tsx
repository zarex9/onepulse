"use client";

import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem/accounts";
import { formatUnits, parseUnits } from "viem/utils";
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
import {
  useWriteDailyRewardsV2Deposit,
  useWriteDailyRewardsV2EmergencyWithdraw,
  useWriteErc20Approve,
} from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";

type VaultStatus = {
  currentBalance: bigint;
  minReserve: bigint;
  availableForClaims: bigint;
};

type VaultStatusCardProps = {
  vaultStatus?: VaultStatus;
  contractAddress: Address;
  chainId: ChainId;
  tokenAddress: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  onRefetchAction: () => void;
};

export function VaultStatusCard({
  vaultStatus,
  contractAddress,
  chainId,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  onRefetchAction,
}: VaultStatusCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [approvalStep, setApprovalStep] = useState(false);
  const [pendingDepositAmount, setPendingDepositAmount] = useState<
    bigint | null
  >(null);

  const approve = useWriteErc20Approve();

  const deposit = useWriteDailyRewardsV2Deposit();

  const emergencyWithdraw = useWriteDailyRewardsV2EmergencyWithdraw();

  useEffect(() => {
    if (approve.data && !approve.isPending) {
      if (!pendingDepositAmount) {
        return;
      }

      toast.success("Approval confirmed");
      deposit.mutate({
        args: [pendingDepositAmount],
        chainId,
      });
    }
  }, [approve.data, approve.isPending, pendingDepositAmount, deposit, chainId]);

  useEffect(() => {
    if (deposit.data && !deposit.isPending) {
      toast.success("Deposit success");
      setDepositAmount("");
      setApprovalStep(false);
      setPendingDepositAmount(null);
      onRefetchAction();
    }
    if (deposit.error && !deposit.isPending) {
      toast.error(deposit.error.message || "Deposit failed");
      setApprovalStep(false);
      setPendingDepositAmount(null);
    }
  }, [deposit.data, deposit.error, deposit.isPending, onRefetchAction]);

  useEffect(() => {
    if (emergencyWithdraw.data && !emergencyWithdraw.isPending) {
      toast.success("Withdraw success");
      setWithdrawAmount("");
      onRefetchAction();
    }
    if (emergencyWithdraw.error && !emergencyWithdraw.isPending) {
      toast.error(emergencyWithdraw.error.message || "Withdraw failed");
    }
  }, [
    emergencyWithdraw.data,
    emergencyWithdraw.error,
    emergencyWithdraw.isPending,
    onRefetchAction,
  ]);

  const isDepositing = deposit.isPending;
  const isWithdrawing = emergencyWithdraw.isPending;

  const getDepositButtonText = () => {
    if (!isDepositing) {
      return "Deposit";
    }
    return approvalStep ? "Approving..." : "Depositing...";
  };

  const handleDeposit = () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const parsed = parseUnits(depositAmount, tokenDecimals);
    setPendingDepositAmount(parsed);
    setApprovalStep(true);

    approve.mutate(
      {
        address: tokenAddress,
        args: [contractAddress, parsed],
        chainId,
      },
      {
        onSuccess: () => {
          toast.info("Approval transaction submitted...");
        },
        onError: (error) => {
          toast.error(error.message || "Approval failed");
          setApprovalStep(false);
          setPendingDepositAmount(null);
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const parsed = parseUnits(withdrawAmount, tokenDecimals);
    emergencyWithdraw.mutate({
      args: [parsed],
      chainId,
    });
  };

  const formatToken = (value?: bigint) => {
    if (value === undefined) {
      return "—";
    }
    return `${Number(formatUnits(value, tokenDecimals)).toLocaleString(undefined, { maximumFractionDigits: 3 })} ${tokenSymbol}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5" />
          Vault Status
        </CardTitle>
        <CardDescription>
          Monitor and manage the {tokenSymbol} token vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Current Balance
            </div>
            <div className="font-bold text-lg">
              {formatToken(vaultStatus?.currentBalance)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Minimum Reserve
            </div>
            <div className="font-bold text-lg">
              {formatToken(vaultStatus?.minReserve)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Available for Claims
            </div>
            <div className="font-bold text-green-600 text-lg dark:text-green-400">
              {formatToken(vaultStatus?.availableForClaims)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deposit">Deposit {tokenSymbol}</Label>
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
                <span className="sr-only">{getDepositButtonText()}</span>
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
                <span className="sr-only">
                  {isWithdrawing ? "..." : "Withdraw"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
