"use client";

import Script from "next/script";
import { useEffect } from "react";

type OnChatType = {
  mount: (
    selector: string,
    config: {
      channel: string;
      theme: string;
      hideMobileTabs: boolean;
      hideBrand: boolean;
      colors: Record<string, string>;
    }
  ) => void;
};

export function OnChatWidget() {
  useEffect(() => {
    // Check if OnChat is already loaded
    const onChat = (window as unknown as { OnChat?: OnChatType }).OnChat;
    if (typeof window !== "undefined" && onChat) {
      onChat.mount("#onchat-widget", {
        channel: "onepulse",
        theme: "base-blue",
        hideMobileTabs: true,
        hideBrand: true,
        colors: {
          primary: "--color-primary-foreground",
          "primary-muted": "--color-muted-foreground",
          "text-dim": "--color-muted-foreground",
          "color-system": "--color-code-highlight",
          "color-error": "--color-destructive",
          "color-info": "--color-3",
          "color-action": "--color-5",
          "color-nick": "--color-2",
          "color-channel": "--color-4",
          "color-timestamp": "--color-muted-foreground",
          "color-content": "--color-card",
          "bg-primary": "--color-background",
          "bg-secondary": "--color-secondary",
          "bg-tertiary": "--color-popover-background",
          "bg-hover": "--color-hover",
        },
      });
    }
  }, []);

  return (
    <>
      <Script
        onLoad={() => {
          // Mount the widget once the script is loaded
          const onChat = (window as unknown as { OnChat?: OnChatType }).OnChat;
          if (onChat) {
            onChat.mount("#onchat-widget", {
              channel: "onepulse",
              theme: "base-blue",
              hideMobileTabs: true,
              hideBrand: true,
              colors: {
                primary: "--color-primary-foreground",
                "primary-muted": "--color-muted-foreground",
                "text-dim": "--color-muted-foreground",
                "color-system": "--color-code-highlight",
                "color-error": "--color-destructive",
                "color-info": "--color-3",
                "color-action": "--color-5",
                "color-nick": "--color-2",
                "color-channel": "--color-4",
                "color-timestamp": "--color-muted-foreground",
                "color-content": "--color-card",
                "bg-primary": "--color-background",
                "bg-secondary": "--color-secondary",
                "bg-tertiary": "--color-popover-background",
                "bg-hover": "--color-hover",
              },
            });
          }
        }}
        src="https://onchat.sebayaki.com/widget.js"
      />
      <div id="onchat-widget" />
    </>
  );
}
