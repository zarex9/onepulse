/**
 * Returns the first 6 and last 4 characters of an address.
 */
export function getSlicedAddress(address: `0x${string}`): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
