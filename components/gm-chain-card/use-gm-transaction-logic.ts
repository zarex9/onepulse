import { useGMCalls } from "./use-gm-calls";

export function useGMTransactionLogic() {
  const calls = useGMCalls();

  const hasCalls = calls.length > 0;

  return {
    calls,
    hasCalls,
  };
}
