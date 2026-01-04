import { useGMCalls } from "./use-gm-calls";

type UseGMTransactionLogicProps = {
  contractAddress: `0x${string}`;
};

export function useGMTransactionLogic({
  contractAddress,
}: UseGMTransactionLogicProps) {
  const calls = useGMCalls({
    contractAddress,
  });

  const hasCalls = calls.length > 0;

  return {
    calls,
    hasCalls,
  };
}
