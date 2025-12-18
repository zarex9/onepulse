import { useGMSharing } from "@/hooks/use-gm-sharing";
import { useShareActions } from "@/hooks/use-share-actions";

export function useShareGMStatusLogic(
  claimedToday: boolean,
  completedAllChains: boolean
) {
  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains
  );
  const { shareToCast } = useShareActions();

  const handleShare = async (platform: "cast" | "copy") => {
    if (!shareUrl) {
      return;
    }

    if (platform === "cast") {
      await shareToCast(shareText, shareUrl);
    }
  };

  return {
    handleShare,
    shareText,
    shareUrl,
  };
}
