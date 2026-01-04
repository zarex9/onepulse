"use client";

import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem/accounts";
import { formatUnits, isAddress, parseUnits } from "viem/utils";
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
import {
  useWriteDailyRewardsV2SetBackendSigner,
  useWriteDailyRewardsV2SetClaimRewardAmount,
  useWriteDailyRewardsV2SetDailyClaimLimit,
  useWriteDailyRewardsV2SetDailyGmContract,
  useWriteDailyRewardsV2SetMinVaultBalance,
  useWriteDailyRewardsV2SetRewardToken,
} from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";

type SettingFieldProps = {
  label: string;
  value: string;
  currentValue: string | undefined;
  isLoading: boolean;
  error?: string;
  onValueChange: (value: string) => void;
  onUpdate: () => void;
};

function SettingField({
  label,
  value,
  currentValue,
  isLoading,
  error,
  onValueChange,
  onUpdate,
}: SettingFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          disabled={isLoading}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={currentValue || "0x..."}
          value={value}
        />
        <Button disabled={isLoading || !value} onClick={onUpdate}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
        </Button>
      </div>
      {error && (
        <p className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
      <p className="text-muted-foreground text-xs">Current: {currentValue}</p>
    </div>
  );
}

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
  return isAddress(value as Address) ? undefined : "Invalid Ethereum address";
};

const validateRewardToken = (value: string): string | undefined => {
  if (!value) {
    return "Token address is required";
  }
  return isAddress(value as Address) ? undefined : "Invalid Ethereum address";
};

const validateDailyClaimLimit = (value: string): string | undefined => {
  if (!value) {
    return "User limit is required";
  }
  try {
    const num = Number.parseInt(value, 10);
    if (Number.isNaN(num) || num <= 0) {
      return "User limit must be greater than 0";
    }
    return;
  } catch {
    return "Invalid number format";
  }
};

type ContractSettingsCardProps = {
  chainId: ChainId;
  tokenSymbol: string;
  tokenDecimals: number;
  minVaultBalance: bigint | undefined;
  claimRewardAmount: bigint | undefined;
  dailyGMContract: string | undefined;
  backendSigner: string | undefined;
  rewardToken: string | undefined;
  dailyClaimLimit: bigint | undefined;
  onRefetchAction: () => void;
};

export function ContractSettingsCard({
  chainId,
  tokenSymbol,
  tokenDecimals,
  minVaultBalance,
  claimRewardAmount,
  dailyGMContract,
  backendSigner,
  rewardToken,
  dailyClaimLimit,
  onRefetchAction,
}: ContractSettingsCardProps) {
  const [newMinVaultBalance, setNewMinVaultBalance] = useState("");
  const [newClaimRewardAmount, setNewClaimRewardAmount] = useState("");
  const [newDailyGMContract, setNewDailyGMContract] = useState("");
  const [newBackendSigner, setNewBackendSigner] = useState("");
  const [newRewardToken, setNewRewardToken] = useState("");
  const [newDailyClaimLimit, setNewDailyClaimLimit] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const setMinVaultBalance = useWriteDailyRewardsV2SetMinVaultBalance();
  const setClaimRewardAmount = useWriteDailyRewardsV2SetClaimRewardAmount();
  const setDailyGMContract = useWriteDailyRewardsV2SetDailyGmContract();
  const setBackendSigner = useWriteDailyRewardsV2SetBackendSigner();
  const setRewardToken = useWriteDailyRewardsV2SetRewardToken();
  const setDailyClaimLimit = useWriteDailyRewardsV2SetDailyClaimLimit();

  useEffect(() => {
    if (minVaultBalance) {
      setNewMinVaultBalance(formatUnits(minVaultBalance, tokenDecimals));
    }
    if (claimRewardAmount) {
      setNewClaimRewardAmount(formatUnits(claimRewardAmount, tokenDecimals));
    }
  }, [minVaultBalance, claimRewardAmount, tokenDecimals]);

  useEffect(() => {
    if (
      setMinVaultBalance.isSuccess ||
      setClaimRewardAmount.isSuccess ||
      setDailyGMContract.isSuccess ||
      setBackendSigner.isSuccess ||
      setRewardToken.isSuccess ||
      setDailyClaimLimit.isSuccess
    ) {
      toast.success("Transaction confirmed!");
      onRefetchAction();
      setNewMinVaultBalance("");
      setNewClaimRewardAmount("");
      setNewDailyGMContract("");
      setNewBackendSigner("");
      setNewRewardToken("");
      setNewDailyClaimLimit("");
      setPendingAction(null);
      setValidationErrors({});
    }
  }, [
    setMinVaultBalance.isSuccess,
    setClaimRewardAmount.isSuccess,
    setDailyGMContract.isSuccess,
    setBackendSigner.isSuccess,
    setRewardToken.isSuccess,
    setDailyClaimLimit.isSuccess,
    onRefetchAction,
  ]);

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

  const handleRewardTokenClick = () => {
    const error = validateRewardToken(newRewardToken);
    if (error) {
      setValidationErrors({ rewardToken: error });
      return;
    }
    setPendingAction("rewardToken");
    setValidationErrors({});
  };

  const handleDailyClaimLimitClick = () => {
    const error = validateDailyClaimLimit(newDailyClaimLimit);
    if (error) {
      setValidationErrors({ dailyClaimLimit: error });
      return;
    }
    setPendingAction("dailyClaimLimit");
    setValidationErrors({});
  };

  const confirmAndExecute = (action: string) => {
    const config = {
      onSuccess: () => {
        toast.info("Transaction submitted...");
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`);
        setPendingAction(null);
      },
    };
    switch (action) {
      case "minVaultBalance": {
        try {
          const parsed = parseUnits(newMinVaultBalance, tokenDecimals);
          setMinVaultBalance.mutate({ args: [parsed], chainId }, config);
        } catch (_err) {
          toast.error("Invalid amount");
          setPendingAction(null);
        }
        break;
      }
      case "claimRewardAmount": {
        try {
          const parsed = parseUnits(newClaimRewardAmount, tokenDecimals);
          setClaimRewardAmount.mutate({ args: [parsed], chainId }, config);
        } catch (_err) {
          toast.error("Invalid amount");
          setPendingAction(null);
        }
        break;
      }
      case "dailyGMContract": {
        setDailyGMContract.mutate(
          { args: [newDailyGMContract as Address], chainId },
          config
        );
        break;
      }
      case "backendSigner": {
        setBackendSigner.mutate(
          { args: [newBackendSigner as Address], chainId },
          config
        );
        break;
      }
      case "rewardToken": {
        setRewardToken.mutate(
          { args: [newRewardToken as Address], chainId },
          config
        );
        break;
      }
      case "dailyClaimLimit": {
        try {
          const parsed = BigInt(Number.parseInt(newDailyClaimLimit, 10));
          setDailyClaimLimit.mutate({ args: [parsed], chainId }, config);
        } catch (_err) {
          toast.error("Invalid claim limit");
          setPendingAction(null);
        }
        break;
      }
      default: {
        break;
      }
    }
  };

  const isLoading =
    setMinVaultBalance.isPending ||
    setClaimRewardAmount.isPending ||
    setDailyGMContract.isPending ||
    setBackendSigner.isPending ||
    setRewardToken.isPending ||
    setDailyClaimLimit.isPending;

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

          <SettingField
            currentValue={backendSigner}
            error={validationErrors.backendSigner}
            isLoading={isLoading}
            label="Backend Signer"
            onUpdate={handleBackendSignerClick}
            onValueChange={(value) => {
              setNewBackendSigner(value);
              if (validationErrors.backendSigner) {
                setValidationErrors({
                  ...validationErrors,
                  backendSigner: "",
                });
              }
            }}
            value={newBackendSigner}
          />

          <SettingField
            currentValue={rewardToken}
            error={validationErrors.rewardToken}
            isLoading={isLoading}
            label="Reward Token Address"
            onUpdate={handleRewardTokenClick}
            onValueChange={(value) => {
              setNewRewardToken(value);
              if (validationErrors.rewardToken) {
                setValidationErrors({
                  ...validationErrors,
                  rewardToken: "",
                });
              }
            }}
            value={newRewardToken}
          />

          <div className="space-y-2">
            <Label>Daily Claim Limit (Max Users Per Day)</Label>
            <div className="flex gap-2">
              <Input
                disabled={isLoading}
                onChange={(e) => {
                  setNewDailyClaimLimit(e.target.value);
                  if (validationErrors.dailyClaimLimit) {
                    setValidationErrors({
                      ...validationErrors,
                      dailyClaimLimit: "",
                    });
                  }
                }}
                placeholder={dailyClaimLimit?.toString() || "100"}
                type="number"
                value={newDailyClaimLimit}
              />
              <Button
                disabled={isLoading || !newDailyClaimLimit}
                onClick={handleDailyClaimLimitClick}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
            {validationErrors.dailyClaimLimit && (
              <p className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.dailyClaimLimit}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Current: {dailyClaimLimit} users per day
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

      <AlertDialog
        onOpenChange={() => setPendingAction(null)}
        open={pendingAction === "rewardToken"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Update Reward Token
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the reward token address from{" "}
              <strong className="break-all">{rewardToken}</strong> to{" "}
              <strong className="break-all">{newRewardToken}</strong>. Rewards
              will be distributed in the new token going forward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                confirmAndExecute("rewardToken");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={() => setPendingAction(null)}
        open={pendingAction === "dailyClaimLimit"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Update Daily Claim Limit
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the maximum number of users who can claim rewards
              per day from <strong>{dailyClaimLimit}</strong> to{" "}
              <strong>{newDailyClaimLimit}</strong> users. Once this limit is
              reached, no more users can claim that day.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                confirmAndExecute("dailyClaimLimit");
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
