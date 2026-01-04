"use client";

import { HeaderRight } from "@/components/header/header-right";
import { useHeaderLogic } from "@/components/header/use-header-logic";
import { UserInfo } from "@/components/user-info";
import type { GmStats } from "@/hooks/use-gm-stats";
import { minikitConfig } from "@/minikit.config";

type HeaderProps = {
  inMiniApp: boolean;
  gmStats?: GmStats;
  onShareClickAction: () => void;
};

export const Header = ({
  inMiniApp,
  gmStats,
  onShareClickAction,
}: HeaderProps) => {
  const { address, user, shouldShowUserInfo, showShareButton } = useHeaderLogic(
    {
      gmStats,
    }
  );
  return (
    <div className="fixed top-0 right-0 left-0 z-20 mx-auto h-16 w-full max-w-lg bg-transparent">
      <div className="flex h-16 items-center justify-between rounded-b-lg border border-border bg-background px-4 shadow-lg">
        <div className="flex-1">
          {shouldShowUserInfo ? (
            <UserInfo address={address} user={user} />
          ) : (
            <div className="font-bold text-2xl">
              {minikitConfig.miniapp.name}
            </div>
          )}
        </div>
        <HeaderRight
          inMiniApp={inMiniApp}
          onShareClickAction={onShareClickAction}
          showShareButton={showShareButton}
        />
      </div>
    </div>
  );
};
