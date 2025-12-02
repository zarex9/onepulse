import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { deserialize, serialize } from "wagmi";
import { getQueryClient } from "@/lib/client";

const persister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null,
  serialize,
  deserialize,
});

export function useQueryClientProviderLogic() {
  const queryClient = getQueryClient();

  return {
    queryClient,
    persister,
  };
}
