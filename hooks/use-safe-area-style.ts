import { useMiniAppContext } from "@/components/providers/miniapp-provider";

type SafeAreaStyle = {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
};

export function useSafeAreaStyle(): SafeAreaStyle {
  const miniAppContext = useMiniAppContext();
  const insets = miniAppContext?.context?.client.safeAreaInsets;

  return {
    marginTop: insets?.top ?? 0,
    marginBottom: insets?.bottom ?? 0,
    marginLeft: insets?.left ?? 0,
    marginRight: insets?.right ?? 0,
  };
}
