import { SavedCollectionPanel } from "@/components/ui/save/SavedCollectionPanel";
import { SavedPostsList } from "@/components/ui/save/SavedPostsList";
import { useGetDefaultCollectionQuery } from "@/redux/api/save/savedCollectionApi";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  const { t } = useTranslation();

  const { data: defaultCol, isLoading: isDefaultColLoading } =
    useGetDefaultCollectionQuery();
  const [activeCollectionId, setActiveCollectionId] = useState<string>("");

  const resolvedId = activeCollectionId || defaultCol?._id || "";

  // ── scroll করলে header লুকানো / উপরে scroll করলে ফিরে আসা ──
  const [headerH, setHeaderH] = useState(0); // list-এর topInset
  const headerHeight = useSharedValue(0);
  const translateY = useSharedValue(0); // 0 = দেখা যাচ্ছে, -headerHeight = লুকানো
  const lastY = useSharedValue(0);

  // FeedList প্রতি scroll-এ scrollY (০ বা তার বেশি) পাঠায়
  const handleScroll = useCallback(
    (y: number) => {
      const diff = y - lastY.value;
      lastY.value = y;

      // একদম উপরে থাকলে header সবসময় দেখা যাবে
      if (y <= 0) {
        translateY.value = 0;
        return;
      }

      // নিচে scroll (diff > 0) → লুকায়, উপরে scroll (diff < 0) → ফিরে আসে
      translateY.value = Math.min(
        0,
        Math.max(-headerHeight.value, translateY.value - diff),
      );
    },
    [lastY, translateY, headerHeight],
  );

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    headerHeight.value = h;
    setHeaderH(h);
  };

  const handleSelect = (id: string) => {
    // collection বদলালে list নতুন করে উপর থেকে শুরু হয়, তাই header-ও রিসেট
    translateY.value = 0;
    lastY.value = 0;
    setActiveCollectionId(id);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      {/* overflow-hidden: header উপরে উঠলে status bar-এর জায়গায় যেন না দেখা যায় */}
      <View className="flex-1 overflow-hidden bg-background dark:bg-dark-background">
        {/* কালেকশন প্যানেল — absolute, scroll-এর সাথে ওঠানামা করে */}
        <Animated.View
          onLayout={handleHeaderLayout}
          style={[
            { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
            headerStyle,
          ]}
        >
          <SavedCollectionPanel activeId={resolvedId} onSelect={handleSelect} />
        </Animated.View>

        {isDefaultColLoading ? (
          <View className="items-center py-16" style={{ paddingTop: headerH }}>
            <View className="w-full h-32 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary mb-3" />
            <View className="w-full h-32 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary mb-3" />
            <View className="w-full h-32 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary" />
          </View>
        ) : resolvedId ? (
          // key দেওয়ায় collection বদলালে list নতুন করে শুরু হয়
          <SavedPostsList
            key={resolvedId}
            collectionId={resolvedId}
            onScroll={handleScroll}
            topInset={headerH}
          />
        ) : (
          <View
            className="items-center justify-center py-16"
            style={{ paddingTop: headerH }}
          >
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
              {t("saveData.selectCollection")}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
