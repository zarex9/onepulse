import useSWR from "swr";
import { getScore } from "@/lib/neynar";

type Score = {
  fid: number;
  score: number;
};

export function useScore(fid: number | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    fid ? ["score", fid] : null,
    async () => {
      if (fid === undefined) {
        return [];
      }
      const response = await getScore([fid]);
      return response.users as Score[];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    score: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
