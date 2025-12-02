import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";
import { useMetaColor } from "@/hooks/use-meta-color";

export function useModeToggleLogic() {
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor, metaColor } = useMetaColor();

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return {
    toggleTheme,
  };
}
