import { useEffect, useState } from "react";
import { getConnectionBuilder } from "@/lib/spacetimedb/connection-factory";

export function useSpacetimeDBProviderLogic() {
  const [connectionBuilder, setConnectionBuilder] = useState<ReturnType<
    typeof getConnectionBuilder
  > | null>(null);

  useEffect(() => {
    // Only create connection builder on client side
    if (typeof window !== "undefined") {
      const builder = getConnectionBuilder();
      setConnectionBuilder(builder);
    }
  }, []);

  return {
    connectionBuilder,
  };
}
