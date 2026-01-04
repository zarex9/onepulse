"use client";

import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { useContentLogic, useHomePage } from "@/hooks/use-home-page";

type ContentProps = {
  tab: string;
  setTab: (tab: string) => void;
};

function Content({ tab, setTab }: ContentProps) {
  const { setGmStats } = useContentLogic();

  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <Header />
      <Tabs
        onGmStatsChangeAction={setGmStats}
        onTabChangeAction={setTab}
        tab={tab}
      />
    </div>
  );
}

export default function Home() {
  const { safeAreaStyle, tab, setTab } = useHomePage();

  return (
    <div className="font-sans" style={safeAreaStyle}>
      <Content setTab={setTab} tab={tab} />
    </div>
  );
}
