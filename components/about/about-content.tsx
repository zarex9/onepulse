"use client";

import Image from "next/image";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { ButtonGroup, ButtonGroupText } from "../ui/button-group";
import {
  BASE_APP_PROFILE_URL,
  FARCASTER_PROFILE_URL,
  GITHUB_URL,
  PRODUCT_CLANK_MINIAPP_URL,
  PRODUCT_CLANK_WEB_URL,
  PROFILE_FID,
  TWITTER_URL,
  useAboutLogic,
} from "./use-about-logic";

export type AboutContentProps = {
  layout?: "page" | "dialog";
};

export function AboutContent({ layout = "page" }: AboutContentProps) {
  const { isInMiniApp, handleOpenMiniApp, handleOpenUrl, handleViewProfile } =
    useAboutLogic();

  const spacingText =
    layout === "dialog" ? "text-sm leading-5" : "text-sm leading-4";
  const listSpacing = layout === "dialog" ? "[&>li]:mt-1" : "[&>li]:mt-2";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className={`text-muted-foreground ${spacingText}`}>
          OnePulse helps you send a daily on-chain GM (a short social greeting),
          track your streaks across multiple networks, and earn DEGEN token
          rewards.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="border-b font-semibold text-lg tracking-tight">
          Networks
        </h2>
        <p className={spacingText}>
          OnePulse currently supports the following networks:
        </p>
        <ul className={`ml-6 list-disc text-xs ${listSpacing}`}>
          <li>Base</li>
          <li>Celo</li>
          <li>Optimism</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="border-b font-semibold text-lg tracking-tight">
          Rewards
        </h2>
        <p className={spacingText}>
          Earn 10 DEGEN tokens per successful daily GM on Base. Rewards reset
          daily and are subject to change.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="border-b font-semibold text-lg tracking-tight">
          Contact & Support
        </h2>
        <p className={spacingText}>
          Need help or want to report a problem?{" "}
          <button
            aria-label="Open support profile"
            className="underline"
            onClick={() =>
              isInMiniApp
                ? handleViewProfile(PROFILE_FID)
                : handleOpenUrl(FARCASTER_PROFILE_URL)
            }
            type="button"
          >
            Open support profile
          </button>
          .
        </p>
      </div>

      <ButtonGroup aria-label="Social links" className="mt-2">
        <ButtonGroupText>Socials</ButtonGroupText>
        <Button
          onClick={() =>
            isInMiniApp
              ? handleViewProfile(PROFILE_FID)
              : handleOpenUrl(BASE_APP_PROFILE_URL)
          }
          size="icon"
          variant="outline"
        >
          <Icons.baseSquare className="h-6 w-6" />
          <span className="sr-only">Base</span>
        </Button>
        <Button
          onClick={() =>
            isInMiniApp
              ? handleViewProfile(PROFILE_FID)
              : handleOpenUrl(FARCASTER_PROFILE_URL)
          }
          size="icon"
          variant="outline"
        >
          <Icons.farcaster className="h-6 w-6" />
          <span className="sr-only">Farcaster</span>
        </Button>
        <Button
          onClick={() => handleOpenUrl(GITHUB_URL)}
          size="icon"
          variant="outline"
        >
          <Icons.gitHub className="h-6 w-6" />
          <span className="sr-only">GitHub</span>
        </Button>
        <Button
          onClick={() =>
            isInMiniApp
              ? handleOpenMiniApp(PRODUCT_CLANK_MINIAPP_URL)
              : handleOpenUrl(PRODUCT_CLANK_WEB_URL)
          }
          size="icon"
          variant="outline"
        >
          <Image
            alt="Product Clank logo"
            height={24}
            src="/productclank.png"
            width={24}
          />
          <span className="sr-only">Product Clank</span>
        </Button>
        <Button
          onClick={() => handleOpenUrl(TWITTER_URL)}
          size="icon"
          variant="outline"
        >
          <Icons.twitter className="h-6 w-6" />
          <span className="sr-only">Twitter</span>
        </Button>
      </ButtonGroup>
    </div>
  );
}
