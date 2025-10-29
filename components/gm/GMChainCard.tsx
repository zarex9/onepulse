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
import { useQueryClient } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { isAddress, type Address } from "viem"
import { useChainId, useReadContract, useSwitchChain } from "wagmi"

import { dailyGMAbi } from "@/lib/abi/dailyGM"
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
import { ConnectWallet } from "@/components/wallet"

type TransactionStatus = "default" | "success" | "error" | "pending"

export type GMChainCardProps = {
  chainId: number
  name: string
  iconSrc?: string
  contractAddress: `0x${string}`
  isConnected: boolean
  address?: string
}

export const GMChainCard = React.memo(function GMChainCard({
  chainId,
  name,
  iconSrc = "/basemark.png",
  contractAddress,
  isConnected,
  address,
}: GMChainCardProps) {
  const { resolvedTheme } = useTheme()
  const [imgSrc, setImgSrc] = useState(iconSrc)
  // After mount or theme change, swap to theme-specific variant for known chains (client-only to avoid SSR mismatch)
  useEffect(() => {
    const lower = name.toLowerCase()
    if (lower === "celo") {
      setImgSrc(
        resolvedTheme === "light" ? "/celomark-dark.png" : "/celomark.png"
      )
    } else if (lower === "optimism") {
      setImgSrc(resolvedTheme === "light" ? "/opmark-dark.png" : "/opmark.png")
    } else {
      setImgSrc(iconSrc)
    }
  }, [iconSrc, name, resolvedTheme])
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = useState("")
  const [processing, setProcessing] = useState(false)
  const currentChainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const onCorrectChain = currentChainId === chainId
  const isCelo = name.toLowerCase() === "celo" || chainId === 42220
  const isOptimism = name.toLowerCase() === "optimism" || chainId === 10
  const chainBtnClasses = isCelo
    ? "bg-[#FCFF52] text-black hover:bg-[#FCFF52]/90 dark:bg-[#476520] dark:text-white dark:hover:bg-[#476520]/90"
    : isOptimism
      ? "bg-[#ff0420] text-white hover:bg-[#ff0420]/90"
      : ""

  const isContractReady = Boolean(contractAddress)
  const isRecipientValid = recipient !== "" && isAddress(recipient)

  // Onchain: lastGMDay(address) on this chain
  const {
    data: lastGmDayData,
    refetch: refetchLastGmDay,
    isPending: isPendingLastGm,
  } = useReadContract({
    chainId,
    abi: dailyGMAbi,
    address: contractAddress,
    functionName: "lastGMDay",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address && isContractReady) },
  })

  // Compute CTA state and countdown target
  const { hasGmToday, gmDisabled, ctaText, targetSec } = useMemo(() => {
    if (!address || !isContractReady) {
      return {
        hasGmToday: false,
        gmDisabled: !isConnected || !isContractReady,
        ctaText: isConnected ? `GM on ${name}` : "Connect wallet to GM",
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
    const currentDay = Math.floor(nowSec / 86400)
    const already = lastDay >= currentDay
    const nextDayStartSec = (currentDay + 1) * 86400
    return {
      hasGmToday: already,
      gmDisabled: already || isPendingLastGm,
      ctaText: already ? "GM in --:--:--" : `GM on ${name}`,
      targetSec: nextDayStartSec,
    }
  }, [
    address,
    isContractReady,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
    name,
  ])

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
        didReport.current = true
        if (addressProp) {
          try {
            await fetch("/api/gm/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: addressProp, chainId }),
            })
          } catch {}
        }
        try {
          if (addressProp) {
            await queryClient.invalidateQueries({
              queryKey: ["gm-stats", addressProp],
            })
          }
        } catch {}
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
    <Item variant="outline">
      <ItemContent>
        <ItemMedia>
          <Image
            src={imgSrc}
            alt={name}
            width={96}
            height={32}
            className="h-8 object-contain"
            onError={() => {
              const lower = name.toLowerCase()
              const fallback =
                lower === "celo"
                  ? "/celomark.png"
                  : lower === "optimism"
                    ? "/opmark.png"
                    : "/basemark.png"
              if (imgSrc !== fallback) setImgSrc(fallback)
            }}
          />
        </ItemMedia>
        <ItemDescription>Boost your {name} onchain footprint.</ItemDescription>
      </ItemContent>
      <ItemActions>
        {!isConnected ? (
          <ConnectWallet size="lg" className={`w-[16ch] ${chainBtnClasses}`} />
        ) : !onCorrectChain ? (
          <Button
            size="lg"
            className={`w-[16ch] ${chainBtnClasses}`}
            onClick={async () => {
              try {
                await switchChain({ chainId })
              } catch (e) {
                console.error("Failed to switch chain", e)
              }
            }}
            disabled={isSwitching}
            aria-busy={isSwitching}
          >
            {isSwitching ? (
              <>
                <Spinner /> Switching…
              </>
            ) : (
              `Switch to ${name}`
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            className={`w-[16ch] ${chainBtnClasses}`}
            disabled={gmDisabled}
            onClick={() => {
              if (!gmDisabled) setOpen(true)
            }}
          >
            {hasGmToday ? `GM in ${countdown}` : ctaText}
          </Button>
        )}
      </ItemActions>

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
                    chainId={chainId}
                    calls={[
                      {
                        abi: dailyGMAbi,
                        address: contractAddress,
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
                              className={`w-full ${chainBtnClasses}`}
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
                    className={`w-full ${chainBtnClasses}`}
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
                    chainId={chainId}
                    calls={[
                      {
                        abi: dailyGMAbi,
                        address: contractAddress,
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
                              className={`w-full ${chainBtnClasses}`}
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
    </Item>
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
