"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
} from "@coinbase/onchainkit/transaction"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"
import { useQueryClient } from "@tanstack/react-query"
import { isAddress } from "viem"
import { useAccount, useReadContract } from "wagmi"

import { dailyGMAbi } from "@/lib/abi/dailyGM"
import { DAILY_GM_ADDRESS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

type TransactionStatus = "default" | "success" | "error" | "pending"

export const GMBase = React.memo(function GMBase() {
  const { isConnected, address } = useAccount()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = useState("")
  const [processing, setProcessing] = useState(false)

  const isContractReady = Boolean(DAILY_GM_ADDRESS && DAILY_GM_ADDRESS !== "")
  const isRecipientValid = recipient !== "" && isAddress(recipient)

  // Onchain: lastGMDay(address)
  const {
    data: lastGmDayData,
    refetch: refetchLastGmDay,
    isPending: isPendingLastGm,
  } = useReadContract({
    abi: dailyGMAbi,
    address: DAILY_GM_ADDRESS as `0x${string}`,
    functionName: "lastGMDay",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && isContractReady) },
  })

  // Compute CTA state and countdown target
  const { hasGmToday, gmDisabled, ctaText, targetSec } = useMemo(() => {
    if (!address || !isContractReady) {
      return {
        hasGmToday: false,
        gmDisabled: !isConnected || !isContractReady,
        ctaText: isConnected ? "GM on Base" : "Connect wallet to GM",
        targetSec: 0,
      }
    }
    if (lastGmDayData === undefined) {
      return {
        hasGmToday: false,
        gmDisabled: true,
        ctaText: "Checking…",
        targetSec: 0,
      }
    }
    const lastDay = Number((lastGmDayData as bigint) ?? 0n)
    const nowSec = Math.floor(Date.now() / 1000)
    // currentDay is the Unix day index in UTC
    const currentDay = Math.floor(nowSec / 86400)
    const already = lastDay >= currentDay
    const nextDayStartSec = (currentDay + 1) * 86400
    return {
      hasGmToday: already,
      gmDisabled: already || isPendingLastGm,
      ctaText: already ? "GM in --:--:--" : "GM on Base",
      targetSec: nextDayStartSec,
    }
  }, [address, isContractReady, isConnected, lastGmDayData, isPendingLastGm])

  // Live countdown if already GM'd today
  const [countdown, setCountdown] = useState("--:--:--")
  useEffect(() => {
    if (!hasGmToday || !targetSec) return
    const fmt = (ms: number) => {
      const total = Math.max(0, Math.floor(ms / 1000))
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${pad(h)}:${pad(m)}:${pad(s)}`
    }
    const tick = () => {
      const nowSec = Math.floor(Date.now() / 1000)
      const ms = Math.max(0, (targetSec - nowSec) * 1000)
      setCountdown(fmt(ms))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hasGmToday, targetSec])

  const close = useCallback(() => {
    setOpen(false)
    setMode("main")
    setRecipient("")
    setProcessing(false)
  }, [])

  function SuccessReporter({
    status,
    onReported,
    message,
    txHash,
    address: addressProp,
    refetchLastGmDay: refetchLastGmDayProp,
  }: {
    status: string
    onReported?: () => void
    message?: string
    txHash?: string
    address?: string
    refetchLastGmDay?: () => Promise<unknown>
  }) {
    const didReport = useRef(false)
    const queryClient = useQueryClient()
    useEffect(() => {
      const report = async () => {
        if (didReport.current) return
        // Mark early to avoid duplicate toasts if effect re-runs
        didReport.current = true
        // Report only if we have an address
        if (addressProp) {
          try {
            await fetch("/api/gm/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: addressProp }),
            })
          } catch {}
        }
        // Refresh cached stats for this address
        try {
          if (addressProp) {
            await queryClient.invalidateQueries({
              queryKey: ["gm-stats", addressProp],
            })
          }
        } catch {}
        // Update onchain lastGMDay so CTA refreshes
        try {
          await refetchLastGmDayProp?.()
        } catch {}
        onReported?.()
      }
      if (status === "success") {
        void report()
      }
    }, [
      status,
      addressProp,
      onReported,
      queryClient,
      refetchLastGmDayProp,
      txHash,
      message,
    ])
    return null
  }

  return (
    <div className="mt-4 space-y-4">
      <Item variant="outline">
        <ItemContent>
          <ItemMedia>
            <Image
              src="/basemark.png"
              alt="Base"
              width={96}
              height={32}
              className="h-8 object-contain"
            />
          </ItemMedia>
          <ItemDescription>Boost your Base onchain footprint.</ItemDescription>
        </ItemContent>
        <ItemActions>
          {isConnected ? (
            <Button
              disabled={gmDisabled}
              onClick={() => {
                if (!gmDisabled) setOpen(true)
              }}
            >
              {hasGmToday ? `GM in ${countdown}` : ctaText}
            </Button>
          ) : (
            <ConnectWallet>Connect Wallet</ConnectWallet>
          )}
        </ItemActions>
      </Item>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!processing) close()
            }}
          />
          <Card className="relative z-10 w-full max-w-sm rounded-2xl p-4">
            {mode === "main" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose GM Type</h3>
                <div className="grid gap-3">
                  <Transaction
                    calls={[
                      {
                        abi: dailyGMAbi,
                        address: DAILY_GM_ADDRESS as `0x${string}`,
                        functionName: "gm",
                      },
                    ]}
                  >
                    <TransactionButton
                      disabled={!isContractReady}
                      render={({
                        onSubmit,
                        isDisabled,
                        status,
                        context,
                      }: {
                        onSubmit: () => void
                        isDisabled: boolean
                        status: TransactionStatus
                        context?: {
                          transactionHash?: string
                          receipt?: { transactionHash?: string }
                          transactionReceipts?: Array<{
                            transactionHash?: string
                          }>
                        }
                        error?: Error | null
                      }) => {
                        const txHash =
                          context?.transactionHash ||
                          context?.receipt?.transactionHash ||
                          context?.transactionReceipts?.[0]?.transactionHash
                        return (
                          <>
                            <ProcessingMirror
                              status={status}
                              onChange={setProcessing}
                            />
                            <Button
                              onClick={onSubmit}
                              disabled={isDisabled}
                              className="w-full"
                              aria-busy={status === "pending"}
                            >
                              {status === "pending" ? (
                                <>
                                  <Spinner />
                                  Processing...
                                </>
                              ) : (
                                "GM"
                              )}
                            </Button>
                            <SuccessReporter
                              status={String(status)}
                              onReported={close}
                              message="GM sent successfully"
                              txHash={txHash}
                              address={address}
                              refetchLastGmDay={refetchLastGmDay}
                            />
                          </>
                        )
                      }}
                    />
                    <TransactionToast position="top-center">
                      <TransactionToastIcon />
                      <TransactionToastLabel />
                      <TransactionToastAction />
                    </TransactionToast>
                  </Transaction>

                  <Button
                    disabled={!isContractReady || processing}
                    onClick={() => setMode("gmTo")}
                    className="w-full"
                    aria-disabled={!isContractReady || processing}
                  >
                    GM to a Fren
                  </Button>

                  <Button
                    variant="outline"
                    onClick={close}
                    className="w-full"
                    disabled={processing}
                    aria-disabled={processing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fren&#39;s Address</h3>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={processing}
                  className="w-full rounded-md border bg-transparent px-3 py-2"
                  aria-label="Recipient wallet address"
                  aria-invalid={recipient !== "" && !isRecipientValid}
                  aria-describedby={
                    recipient !== "" && !isRecipientValid
                      ? "recipient-error"
                      : undefined
                  }
                />
                {recipient && !isRecipientValid && (
                  <p
                    id="recipient-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
                    Enter a valid address.
                  </p>
                )}
                <div className="grid gap-3">
                  <Transaction
                    calls={[
                      {
                        abi: dailyGMAbi,
                        address: DAILY_GM_ADDRESS as `0x${string}`,
                        functionName: "gmTo",
                        args: [recipient as `0x${string}`],
                      },
                    ]}
                  >
                    <TransactionButton
                      disabled={
                        !isRecipientValid || !isContractReady || processing
                      }
                      render={({
                        onSubmit,
                        isDisabled,
                        status,
                        context,
                      }: {
                        onSubmit: () => void
                        isDisabled: boolean
                        status: TransactionStatus
                        context?: {
                          transactionHash?: string
                          receipt?: { transactionHash?: string }
                          transactionReceipts?: Array<{
                            transactionHash?: string
                          }>
                        }
                        error?: Error | null
                      }) => {
                        const txHash =
                          context?.transactionHash ||
                          context?.receipt?.transactionHash ||
                          context?.transactionReceipts?.[0]?.transactionHash
                        return (
                          <>
                            <ProcessingMirror
                              status={status}
                              onChange={setProcessing}
                            />
                            <Button
                              onClick={onSubmit}
                              disabled={isDisabled}
                              className="w-full"
                              aria-busy={status === "pending"}
                            >
                              {status === "pending" ? "Sending..." : "Send GM"}
                            </Button>
                            <SuccessReporter
                              status={String(status)}
                              onReported={close}
                              message={
                                recipient
                                  ? `GM sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`
                                  : "GM sent successfully"
                              }
                              txHash={txHash}
                              address={address}
                              refetchLastGmDay={refetchLastGmDay}
                            />
                          </>
                        )
                      }}
                    />
                    <TransactionToast position="top-center">
                      <TransactionToastIcon />
                      <TransactionToastLabel />
                      <TransactionToastAction />
                    </TransactionToast>
                  </Transaction>
                  <Button
                    variant="outline"
                    onClick={() => setMode("main")}
                    disabled={processing}
                    className="w-full"
                    aria-disabled={processing}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
})

const ProcessingMirror = React.memo(function ProcessingMirror({
  status,
  onChange,
}: {
  status: TransactionStatus
  onChange: (pending: boolean) => void
}) {
  useEffect(() => {
    onChange(status === "pending")
  }, [status, onChange])
  return null
})
