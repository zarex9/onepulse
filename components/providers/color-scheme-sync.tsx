"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Keeps documentElement.style.colorScheme in sync with the resolved theme.
 * This avoids SSR hydration differences while ensuring native controls match theme post-hydration.
 */
export function ColorSchemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const scheme = resolvedTheme === "dark" ? "dark" : "light";
    document.documentElement.style.colorScheme = scheme;
  }, [resolvedTheme]);

  return null;
}
