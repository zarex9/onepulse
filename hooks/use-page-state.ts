import { useConnection } from "wagmi";

export function usePageState() {
  const { address, isConnected } = useConnection();

  return { isConnected, address };
}
