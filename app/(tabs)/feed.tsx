import HomeFeed from "@/components/layout/feed/HomeFeed";
import FeedTabs, { type FeedTabKey } from "@/components/ui/feed/FeedTabs";
import ForYouFeed from "@/components/ui/feed/ForYouFeed";
import { Header } from "@/components/ui/headers/Header";
import { useExitConfirm } from "@/hooks/useBackHandler";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedScreen() {
  useExitConfirm();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<FeedTabKey>("forYou");
  // "সর্বশেষ" tab প্রথমবার চাপলে তবেই লোড হবে
  const [latestMounted, setLatestMounted] = useState(false);

  // ---------- Collapsing header ----------
  const [headerH, setHeaderH] = useState(0); // শুধু Header এর উচ্চতা
  const [tabsH, setTabsH] = useState(0); // শুধু Tabs এর উচ্চতা
  const headerHRef = useRef(0);

  // 0 = header দেখাচ্ছে, headerH = পুরো লুকানো
  const offset = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(0);
  const lastY = useRef<Record<FeedTabKey, number>>({ forYou: 0, latest: 0 });
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateTo = useCallback(
    (to: number) => {
      offset.stopAnimation();
      offsetRef.current = to;
      Animated.timing(offset, {
        toValue: to,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [offset],
  );

  const scheduleSnap = useCallback(() => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const h = headerHRef.current;
      if (h <= 0) return;
      const cur = offsetRef.current;
      if (cur <= 0 || cur >= h) return;
      animateTo(cur > h / 2 ? h : 0);
    }, 120);
  }, [animateTo]);

  useEffect(() => {
    return () => {
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, []);

  const makeScrollHandler = useCallback(
    (key: FeedTabKey) => (y: number) => {
      const h = headerHRef.current;
      const delta = y - lastY.current[key];
      lastY.current[key] = y;
      if (h <= 0) return;

      // একদম উপরে (বা iOS bounce) হলে header পুরো দেখাও
      if (y <= 0) {
        if (offsetRef.current !== 0) {
          offset.stopAnimation();
          offsetRef.current = 0;
          offset.setValue(0);
        }
        return;
      }
      if (delta === 0) return;

      // আঙুলের সাথে সাথে header নড়বে (0 থেকে h এর মধ্যে)
      const next = Math.min(h, Math.max(0, offsetRef.current + delta));
      if (next !== offsetRef.current) {
        offset.stopAnimation();
        offsetRef.current = next;
        offset.setValue(next);
      }
      scheduleSnap();
    },
    [offset, scheduleSnap],
  );

  const onForYouScroll = useMemo(
    () => makeScrollHandler("forYou"),
    [makeScrollHandler],
  );
  const onLatestScroll = useMemo(
    () => makeScrollHandler("latest"),
    [makeScrollHandler],
  );

  const handleChangeTab = (next: FeedTabKey) => {
    if (next === "latest") setLatestMounted(true);
    setTab(next);
    // tab বদলালে header ফিরিয়ে আনো
    if (offsetRef.current !== 0) animateTo(0);
  };

  const totalH = headerH + tabsH;
  const ready = headerH > 0 && tabsH > 0;

  // header + tabs পুরো container উপরে উঠবে, tabs উপরে আটকে থাকবে
  const barTranslate = Animated.multiply(offset, -1);

  // feed ও একই পরিমাণ উপরে উঠবে, যাতে নিচে ফাঁকা জায়গা না থাকে
  const feedTranslate = Animated.multiply(offset, -1);

  const headerOpacity = offset.interpolate({
    inputRange: [0, Math.max(headerH, 1)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-background"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1 overflow-hidden">
        {/* Feed: দুটোই mounted থাকে, scroll অবস্থান হারায় না */}
        {ready && (
          <Animated.View
            style={{
              position: "absolute",
              top: totalH,
              left: 0,
              right: 0,
              // header লুকালে feed উপরে উঠবে, তাই নিচে headerH বাড়তি জায়গা
              bottom: -headerH,
              transform: [{ translateY: feedTranslate }],
            }}
          >
            <View
              style={{ flex: 1, display: tab === "forYou" ? "flex" : "none" }}
            >
              <ForYouFeed
                isActive={tab === "forYou"}
                onScroll={onForYouScroll}
              />
            </View>

            {latestMounted && (
              <View
                style={{
                  flex: 1,
                  display: tab === "latest" ? "flex" : "none",
                }}
              >
                <HomeFeed
                  isActive={tab === "latest"}
                  onScroll={onLatestScroll}
                />
              </View>
            )}
          </Animated.View>
        )}

        {/* Header + Tabs */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            transform: [{ translateY: barTranslate }],
          }}
        >
          <Animated.View
            className="bg-background dark:bg-dark-background"
            style={{ opacity: headerOpacity }}
            onLayout={(e) => {
              const h = Math.round(e.nativeEvent.layout.height);
              if (h > 0 && h !== headerHRef.current) {
                headerHRef.current = h;
                setHeaderH(h);
              }
            }}
          >
            <Header />
          </Animated.View>

          <View
            className="bg-background dark:bg-dark-background"
            onLayout={(e) => {
              const h = Math.round(e.nativeEvent.layout.height);
              if (h > 0 && h !== tabsH) setTabsH(h);
            }}
          >
            <FeedTabs active={tab} onChange={handleChangeTab} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
