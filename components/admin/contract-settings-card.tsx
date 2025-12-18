"use client";

import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatUnits, isAddress, parseUnits } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";

type ContractSettingsCardProps = {
  contractAddress: `0x${string}`;
  chainId: number;
  tokenSymbol: string;
  tokenDecimals: number;
  minVaultBalance: bigint | undefined;
  claimRewardAmount: bigint | undefined;
  dailyGMContract: string | undefined;
  backendSigner: string | undefined;
  onRefetchAction: () => void;
};

export function ContractSettingsCard({
  contractAddress,
  chainId,
  tokenSymbol,
  tokenDecimals,
  minVaultBalance,
  claimRewardAmount,
  dailyGMContract,
  backendSigner,
  onRefetchAction,
}: ContractSettingsCardProps) {
  const [newMinVaultBalance, setNewMinVaultBalance] = useState("");
  const [newClaimRewardAmount, setNewClaimRewardAmount] = useState("");
  const [newDailyGMContract, setNewDailyGMContract] = useState("");
  const [newBackendSigner, setNewBackendSigner] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const { writeContract, isPending, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (minVaultBalance) {
      setNewMinVaultBalance(formatUnits(minVaultBalance, tokenDecimals));
    }
    if (claimRewardAmount) {
      setNewClaimRewardAmount(formatUnits(claimRewardAmount, tokenDecimals));
    }
  }, [minVaultBalance, claimRewardAmount, tokenDecimals]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed!");
      onRefetchAction();
      setNewMinVaultBalance("");
      setNewClaimRewardAmount("");
      setNewDailyGMContract("");
      setNewBackendSigner("");
      setPendingAction(null);
      setValidationErrors({});
    }
  }, [isSuccess, onRefetchAction]);

  const validateMinVaultBalance = (value: string): string | undefined => {
    if (!value) {
      return "Amount is required";
    }
    try {
      const num = Number.parseFloat(value);
      if (Number.isNaN(num) || num <= 0) {
        return "Amount must be greater than 0";
      }
      if (num > 1_000_000) {
        return "Amount seems too large";
      }
      return;
    } catch {
      return "Invalid amount format";
    }
  };

  const validateClaimRewardAmount = (value: string): string | undefined => {
    if (!value) {
      return "Amount is required";
    }
    try {
      const num = Number.parseFloat(value);
      if (Number.isNaN(num) || num <= 0) {
        return "Amount must be greater than 0";
      }
      if (num > 1000) {
        return "Amount seems too large";
      }
      return;
    } catch {
      return "Invalid amount format";
    }
  };

  const validateDailyGMContract = (value: string): string | undefined => {
    if (!value) {
      return "Contract address is required";
    }
    return isAddress(value as `0x${string}`)
      ? undefined
      : "Invalid Ethereum address";
  };

  const handleMinVaultBalanceClick = () => {
    const error = validateMinVaultBalance(newMinVaultBalance);
    if (error) {
      setValidationErrors({ minVaultBalance: error });
      return;
    }
    setPendingAction("minVaultBalance");
    setValidationErrors({});
  };

  const handleClaimRewardAmountClick = () => {
    const error = validateClaimRewardAmount(newClaimRewardAmount);
    if (error) {
      setValidationErrors({ claimRewardAmount: error });
      return;
    }
    setPendingAction("claimRewardAmount");
    setValidationErrors({});
  };

  const handleDailyGMContractClick = () => {
    const error = validateDailyGMContract(newDailyGMContract);
    if (error) {
      setValidationErrors({ dailyGMContract: error });
      return;
    }
    setPendingAction("dailyGMContract");
    setValidationErrors({});
  };

  const handleBackendSignerClick = () => {
    const error = validateDailyGMContract(newBackendSigner);
    if (error) {
      setValidationErrors({ backendSigner: error });
      return;
    }
    setPendingAction("backendSigner");
    setValidationErrors({});
  };

  const confirmAndExecute = (action: string) => {
    if (action === "minVaultBalance") {
      try {
        const parsed = parseUnits(newMinVaultBalance, tokenDecimals);
        writeContract(
          {
            address: contractAddress,
            abi: dailyRewardsV2Abi,
            functionName: "setMinVaultBalance",
            args: [parsed],
            chainId,
          },
          {
            onSuccess: () => {
              toast.info("Transaction submitted...");
            },
            onError: (error) => {
              toast.error(`Error: ${error.message}`);
              setPendingAction(null);
            },
          }
        );
      } catch (_err) {
        toast.error("Invalid amount");
        setPendingAction(null);
      }
    } else if (action === "claimRewardAmount") {
      try {
        const parsed = parseUnits(newClaimRewardAmount, tokenDecimals);
        writeContract(
          {
            address: contractAddress,
            abi: dailyRewardsV2Abi,
            functionName: "setClaimRewardAmount",
            args: [parsed],
            chainId,
          },
          {
            onSuccess: () => {
              toast.info("Transaction submitted...");
            },
            onError: (error) => {
              toast.error(`Error: ${error.message}`);
              setPendingAction(null);
            },
          }
        );
      } catch (_err) {
        toast.error("Invalid amount");
        setPendingAction(null);
      }
    } else if (action === "dailyGMContract") {
      writeContract(
        {
          address: contractAddress,
          abi: dailyRewardsV2Abi,
          functionName: "setDailyGMContract",
          args: [newDailyGMContract as `0x${string}`],
          chainId,
        },
        {
          onSuccess: () => {
            toast.info("Transaction submitted...");
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
            setPendingAction(null);
          },
        }
      );
    } else if (action === "backendSigner") {
      writeContract(
        {
          address: contractAddress,
          abi: dailyRewardsV2Abi,
          functionName: "setBackendSigner",
          args: [newBackendSigner as `0x${string}`],
          chainId,
        },
        {
          onSuccess: () => {
            toast.info("Transaction submitted...");
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
            setPendingAction(null);
          },
        }
      );
    }
  };

  const isLoading = isPending || isConfirming;
  const formatBalance = (value: bigint | undefined): string => {
    if (value === undefined) {
      return "—";
    }
    return Number(formatUnits(value, tokenDecimals)).toLocaleString(undefined, {
      maximumFractionDigits: 3,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contract Settings</CardTitle>
          <CardDescription>Manage core contract parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Minimum Vault Balance ({tokenSymbol})</Label>
            <div className="flex gap-2">
              <Input
                disabled={isLoading}
                onChange={(e) => {
                  setNewMinVaultBalance(e.target.value);
                  if (validationErrors.minVaultBalance) {
                    setValidationErrors({
                      ...validationErrors,
                      minVaultBalance: "",
                    });
                  }
                }}
                placeholder={formatBalance(minVaultBalance)}
                value={newMinVaultBalance}
              />
              <Button
                disabled={isLoading || !newMinVaultBalance}
                onClick={handleMinVaultBalanceClick}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
            {validationErrors.minVaultBalance && (
              <p className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.minVaultBalance}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Current: {formatBalance(minVaultBalance)} {tokenSymbol}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Claim Reward Amount ({tokenSymbol})</Label>
            <div className="flex gap-2">
              <Input
                disabled={isLoading}
                onChange={(e) => {
                  setNewClaimRewardAmount(e.target.value);
                  if (validationErrors.claimRewardAmount) {
                    setValidationErrors({
                      ...validationErrors,
                      claimRewardAmount: "",
                    });
                  }
                }}
                placeholder={formatBalance(claimRewardAmount)}
                value={newClaimRewardAmount}
              />
              <Button
                disabled={isLoading || !newClaimRewardAmount}
                onClick={handleClaimRewardAmountClick}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
            {validationErrors.claimRewardAmount && (
              <p className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.claimRewardAmount}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Current: {formatBalance(claimRewardAmount)} {tokenSymbol}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Daily GM Contract Address</Label>
            <div className="flex gap-2">
              <Input
                disabled={isLoading}
                onChange={(e) => {
                  setNewDailyGMContract(e.target.value);
                  if (validationErrors.dailyGMContract) {
                    setValidationErrors({
                      ...validationErrors,
                      dailyGMContract: "",
                    });
                  }
                }}
                placeholder={dailyGMContract || "0x..."}
                value={newDailyGMContract}
              />
              <Button
                disabled={isLoading || !newDailyGMContract}
                onClick={handleDailyGMContractClick}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
            {validationErrors.dailyGMContract && (
              <p className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.dailyGMContract}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Current: {dailyGMContract}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Backend Signer</Label>
            <div className="flex gap-2">
              <Input
                disabled={isLoading}
                onChange={(e) => {
                  setNewBackendSigner(e.target.value);
                  if (validationErrors.backendSigner) {
                    setValidationErrors({
                      ...validationErrors,
                      backendSigner: "",
                    });
                  }
                }}
                placeholder={backendSigner}
                value={newBackendSigner}
              />
              <Button
                disabled={isLoading || !newBackendSigner}
                onClick={handleBackendSignerClick}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
            {validationErrors.backendSigner && (
              <p className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.backendSigner}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Current: {backendSigner}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        onOpenChange={() => setPendingAction(null)}
        open={pendingAction === "minVaultBalance"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Update Minimum Vault Balance
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the minimum {tokenSymbol} balance required in the
              vault from{" "}
              <strong>
                {formatBalance(minVaultBalance)} {tokenSymbol}
              </strong>{" "}
              to{" "}
              <strong>
                {newMinVaultBalance} {tokenSymbol}
              </strong>
              . This is a critical contract parameter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                confirmAndExecute("minVaultBalance");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={() => setPendingAction(null)}
        open={pendingAction === "claimRewardAmount"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Update Claim Reward Amount
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the reward per claim from{" "}
              <strong>
                {formatBalance(claimRewardAmount)} {tokenSymbol}
              </strong>{" "}
              to{" "}
              <strong>
                {newClaimRewardAmount} {tokenSymbol}
              </strong>
              . This affects all future claims.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                confirmAndExecute("claimRewardAmount");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={() => setPendingAction(null)}
        open={pendingAction === "dailyGMContract"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Update Daily GM Contract
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the Daily GM contract address from{" "}
              <strong className="break-all">{dailyGMContract}</strong> to{" "}
              <strong className="break-all">{newDailyGMContract}</strong>. Users
              must send a GM to claim rewards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                confirmAndExecute("dailyGMContract");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={() => setPendingAction(null)}
        open={pendingAction === "backendSigner"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Backend Signer</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the backend signer address from{" "}
              <strong className="break-all">{backendSigner}</strong> to{" "}
              <strong className="break-all">{newBackendSigner}</strong>. The new
              address will be used to verify reward claims.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                confirmAndExecute("backendSigner");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
