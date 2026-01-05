import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DailyGm
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const dailyGmAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "recipient",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GM",
  },
  {
    type: "function",
    inputs: [],
    name: "gm",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "recipient", internalType: "address", type: "address" }],
    name: "gmTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "lastGMDay",
    outputs: [{ name: "lastGMDay", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const dailyGmAddress = {
  8453: "0xC9F754F99C069779486Eb9d70b46209c9Ed396CA",
} as const;

/**
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const dailyGmConfig = {
  address: dailyGmAddress,
  abi: dailyGmAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useReadDailyGm = /*#__PURE__*/ createUseReadContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"lastGMDay"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useReadDailyGmLastGmDay = /*#__PURE__*/ createUseReadContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "lastGMDay",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useWriteDailyGm = /*#__PURE__*/ createUseWriteContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gm"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useWriteDailyGmGm = /*#__PURE__*/ createUseWriteContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gm",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gmTo"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useWriteDailyGmGmTo = /*#__PURE__*/ createUseWriteContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gmTo",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useSimulateDailyGm = /*#__PURE__*/ createUseSimulateContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gm"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useSimulateDailyGmGm = /*#__PURE__*/ createUseSimulateContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gm",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gmTo"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useSimulateDailyGmGmTo = /*#__PURE__*/ createUseSimulateContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gmTo",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useWatchDailyGmEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyGmAbi}__ and `eventName` set to `"GM"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 */
export const useWatchDailyGmGmEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: dailyGmAbi, address: dailyGmAddress, eventName: "GM" }
);
