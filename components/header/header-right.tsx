import {
  Bell,
  Bookmark,
  BookOpenText,
  Info,
  Settings,
  Share2,
  SunMoon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { memo, useCallback, useMemo, useState } from "react";
import { AboutDialog } from "@/components/header/about-dialog";
import { HowItWorksDialog } from "@/components/header/how-it-works-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderRightProps = {
  canConfigureMiniApp: boolean;
  isMiniAppSaved: boolean;
  notificationsEnabled: boolean;
  showAdminButton: boolean;
  showShareButton: boolean;
  inMiniApp: boolean;
  onSaveClick: () => Promise<void> | void;
  onNotificationToggle: () => Promise<void> | void;
  onShareClick: () => void;
};

export const HeaderRight = memo(
  ({
    canConfigureMiniApp,
    isMiniAppSaved,
    notificationsEnabled,
    showAdminButton,
    showShareButton,
    inMiniApp,
    onSaveClick,
    onNotificationToggle,
    onShareClick,
  }: HeaderRightProps) => {
    const router = useRouter();
    const { resolvedTheme, setTheme, theme } = useTheme();
    const [aboutOpen, setAboutOpen] = useState(false);
    const [howItWorksOpen, setHowItWorksOpen] = useState(false);
    const [isMenuBusy, setIsMenuBusy] = useState(false);

    const selectedTheme = useMemo(
      () => resolvedTheme ?? theme ?? "system",
      [resolvedTheme, theme]
    );

    const handleAdminClick = useCallback(() => {
      router.push("/admin");
    }, [router]);

    const runMenuAction = useCallback(
      async (action: () => Promise<void> | void) => {
        if (isMenuBusy) {
          return;
        }
        setIsMenuBusy(true);
        try {
          await action();
        } finally {
          setIsMenuBusy(false);
        }
      },
      [isMenuBusy]
    );

    const saveDisabled = !canConfigureMiniApp;
    const notificationDisabled = !canConfigureMiniApp;

    return (
      <div className="flex items-center gap-1">
        {showShareButton && (
          <Button
            className="group/toggle extend-touch-target size-8"
            onClick={onShareClick}
            size="icon"
            title="Share"
            variant="ghost"
          >
            <Share2 className="size-4.5" />
            <span className="sr-only">Share</span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open settings menu"
              className="group/toggle extend-touch-target size-8"
              size="icon"
              variant="ghost"
            >
              <Settings className="size-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {showAdminButton && (
              <DropdownMenuItem onClick={handleAdminClick}>
                <Settings className="size-4" />
                Admin
              </DropdownMenuItem>
            )}
            {inMiniApp && (
              <>
                <DropdownMenuCheckboxItem
                  checked={isMiniAppSaved}
                  disabled={saveDisabled || isMenuBusy}
                  onCheckedChange={() => runMenuAction(onSaveClick)}
                >
                  <Bookmark className="size-4" />
                  Save Mini App
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={notificationsEnabled}
                  disabled={notificationDisabled || isMenuBusy}
                  onCheckedChange={() => runMenuAction(onNotificationToggle)}
                >
                  <Bell className="size-4" />
                  Notifications
                </DropdownMenuCheckboxItem>
              </>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoon className="size-4" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  onValueChange={setTheme}
                  value={selectedTheme}
                >
                  <DropdownMenuRadioItem value="light">
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setAboutOpen(true)}>
              <Info className="size-4" />
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHowItWorksOpen(true)}>
              <BookOpenText className="size-4" />
              How It Works
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
);
