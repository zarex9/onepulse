"use client";

import {
  BookOpenText,
  EllipsisVertical,
  Info,
  RefreshCcw,
  Share2,
} from "lucide-react";
import { useState } from "react";
import {
  BASE_APP_PROFILE_URL,
  FARCASTER_PROFILE_URL,
  PROFILE_FID,
  useAboutLogic,
} from "@/components/about/use-about-logic";
import { AboutDialog } from "@/components/header/about-dialog";
import { HowItWorksDialog } from "@/components/header/how-it-works-dialog";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderRightProps = {
  showShareButton: boolean;
  inMiniApp: boolean;
  onShareClickAction: () => void;
};

export function HeaderRight({
  showShareButton,
  inMiniApp,
  onShareClickAction,
}: HeaderRightProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const { handleOpenUrl, handleViewProfile } = useAboutLogic();

  const handleReload = () => {
    window.location.reload();
  };

  const handleFarcasterClick = () => {
    if (inMiniApp) {
      handleViewProfile(PROFILE_FID);
      return;
    }
    handleOpenUrl(FARCASTER_PROFILE_URL);
  };

  const handleBaseAppClick = () => {
    if (inMiniApp) {
      handleViewProfile(PROFILE_FID);
      return;
    }
    handleOpenUrl(BASE_APP_PROFILE_URL);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        className="group/toggle extend-touch-target size-8"
        onClick={handleReload}
        size="icon"
        title="Reload"
        variant="outline"
      >
        <RefreshCcw className="size-4.5" />
        <span className="sr-only">Reload</span>
      </Button>
      {showShareButton && (
        <Button
          className="group/toggle extend-touch-target size-8"
          onClick={onShareClickAction}
          size="icon"
          title="Share"
          variant="outline"
        >
          <Share2 className="size-4.5" />
          <span className="sr-only">Share</span>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open settings"
            className="group/toggle extend-touch-target size-8"
            variant="outline"
          >
            <EllipsisVertical className="size-4.5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setAboutOpen(true)}>
            <Info className="size-4" />
            About
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHowItWorksOpen(true)}>
            <BookOpenText className="size-4" />
            How It Works
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Social</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleFarcasterClick}>
            <Icons.farcaster className="size-4" />
            Farcaster
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBaseAppClick}>
            <Icons.baseSquare className="size-4" />
            Base app
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AboutDialog onOpenChangeAction={setAboutOpen} open={aboutOpen} />
      <HowItWorksDialog
        onOpenChangeAction={setHowItWorksOpen}
        open={howItWorksOpen}
      />
    </div>
  );
}
