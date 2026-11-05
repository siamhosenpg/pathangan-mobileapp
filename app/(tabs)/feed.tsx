import HomeFeed from "@/components/layout/feed/HomeFeed";
import FeedTabs, { type FeedTabKey } from "@/components/ui/feed/FeedTabs";
import ForYouFeed from "@/components/ui/feed/ForYouFeed";
import CollapsibleLayout from "@/components/ui/headers/CollapsibleLayout";
import { Header } from "@/components/ui/headers/Header";
import { useCollapsibleHeader } from "@/hooks/header/useCollapsibleHeader";
import { useExitConfirm } from "@/hooks/useBackHandler";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedScreen() {
  useExitConfirm();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<FeedTabKey>("forYou");
  // "সর্বশেষ" tab প্রথমবার চাপলে তবেই লোড হবে
  const [latestMounted, setLatestMounted] = useState(false);

  const collapsible = useCollapsibleHeader();
  const onForYouScroll = collapsible.getScrollHandler("forYou");
  const onLatestScroll = collapsible.getScrollHandler("latest");

  const handleChangeTab = (next: FeedTabKey) => {
    if (next === "latest") setLatestMounted(true);
    setTab(next);
    // tab বদলালে header + tabs ফিরিয়ে আনো
    collapsible.showBar();
  };

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-background"
      style={{ paddingTop: insets.top }}
    >
      <CollapsibleLayout
        collapsible={collapsible}
        header={
          <Header
            bottom={<FeedTabs active={tab} onChange={handleChangeTab} />}
          />
        }
      >
        {/* দুটোই mounted থাকে, scroll অবস্থান হারায় না */}
        <View style={{ flex: 1, display: tab === "forYou" ? "flex" : "none" }}>
          <ForYouFeed
            isActive={tab === "forYou"}
            onScroll={onForYouScroll}
            topInset={collapsible.barH}
          />
        </View>

        {latestMounted && (
          <View
            style={{ flex: 1, display: tab === "latest" ? "flex" : "none" }}
          >
            <HomeFeed
              isActive={tab === "latest"}
              onScroll={onLatestScroll}
              topInset={collapsible.barH}
            />
          </View>
        )}
      </CollapsibleLayout>
    </View>
  );
}
