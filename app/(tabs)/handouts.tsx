import HandoutCard from "@/components/ui/card/handout/HandoutCard";
import HandoutCardSkeleton from "@/components/ui/card/handout/HandoutCardSkeleton";
import {
  useGetAllHandoutsInfiniteInfiniteQuery,
  useGetMyHandoutsQuery,
} from "@/redux/api/handout/handoutApi";
import type { Handout, HandoutCategory } from "@/types/handoutTypes";
import { toBanglaNumber } from "@/utils/toBanglaNumber";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories: { key: HandoutCategory | null; label: string }[] = [
  { key: null, label: "সব" },
  { key: "golpo", label: "গল্প" },
  { key: "itihash", label: "ইতিহাস" },
  { key: "dharmiyo", label: "ধর্মীয়" },
  { key: "kobita", label: "কবিতা" },
  { key: "ovizoggota", label: "অভিজ্ঞতা" },
  { key: "onnanno", label: "অন্যান্য" },
];

const CATEGORY_BAR_HEIGHT = 56;
const HIDE_SHOW_THRESHOLD = 6;

function DraftStrip({ isDark }: { isDark: boolean }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const n = (num: number) => (isBn ? toBanglaNumber(num) : String(num));

  const { data, refetch } = useGetMyHandoutsQuery({ status: "draft" });
  const drafts = data?.data ?? [];

  // ✅ ফিড স্ক্রিন focus হলে draft strip নিঃশব্দে (background এ) রিফ্রেশ হবে,
  // কোনো loading UI দেখাবে না বলে flicker হবে না
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (drafts.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <Text className="text-sm font-bold text-text dark:text-dark-text">
            আপনার অপ্রকাশিত লেখা
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/handouts/mine")}>
          <Text className="text-xs font-semibold text-accent">সব দেখুন</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {drafts.map((item) => (
          <TouchableOpacity
            key={item._id}
            activeOpacity={0.85}
            onPress={() => router.push(`/handouts/manage/${item._id}`)}
            className="w-40 rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
          >
            <View className="w-full h-24 bg-background-tertiary dark:bg-dark-background-tertiary">
              {item.coverImage ? (
                <Image
                  source={{ uri: item.coverImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={isDark ? "#4b5563" : "#9ca3af"}
                  />
                </View>
              )}
              <View className="absolute top-2 left-2 bg-yellow-500 px-2 py-0.5 rounded-full">
                <Text className="text-[9px] font-bold text-white">ড্রাফট</Text>
              </View>
            </View>
            <View className="p-2.5 gap-1">
              <Text
                numberOfLines={1}
                className="text-xs font-bold text-text dark:text-dark-text"
              >
                {item.title}
              </Text>
              <Text className="text-[10px] text-text-tertiary dark:text-dark-text-tertiary">
                {n(item.chaptersCount)} অধ্যায়
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function HandoutsFeedScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeCategory, setActiveCategory] = useState<HandoutCategory | null>(
    null,
  );
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetAllHandoutsInfiniteInfiniteQuery({ category: activeCategory });

  const handouts: Handout[] = data?.pages?.flatMap((page) => page.data) ?? [];

  // ✅ ট্যাব ফোকাস হলে ডেটা নিঃশব্দে (background এ) রিফ্রেশ হয় — data আগে থেকে
  // থাকলে skeleton আর দেখানো হবে না, তাই "reload" এর মতো লাগবে না
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onManualRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Handout }) => <HandoutCard handout={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Handout) => item._id, []);

  const renderSeparator = useCallback(() => <View className="h-4" />, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color="#00914d" />
      </View>
    );
  }, [isFetchingNextPage]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ Scroll করলে ক্যাটাগরি বার লুকাবে/দেখাবে (Animated, নরম motion সহ)
  const categoryTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isCategoryVisible = useRef(true);

  const animateCategoryBar = useCallback(
    (visible: boolean) => {
      if (isCategoryVisible.current === visible) return;
      isCategoryVisible.current = visible;
      Animated.timing(categoryTranslateY, {
        toValue: visible ? 0 : -CATEGORY_BAR_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    },
    [categoryTranslateY],
  );

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;

      if (currentY <= 0) {
        animateCategoryBar(true);
      } else if (diff > HIDE_SHOW_THRESHOLD) {
        animateCategoryBar(false);
      } else if (diff < -HIDE_SHOW_THRESHOLD) {
        animateCategoryBar(true);
      }

      lastScrollY.current = currentY;
    },
    [animateCategoryBar],
  );

  const renderListHeader = useCallback(
    () => (
      <View style={{ paddingTop: 12 }}>
        <DraftStrip isDark={isDark} />
      </View>
    ),
    [isDark],
  );

  const CategoryBar = (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-10 bg-background dark:bg-dark-background border-b border-border dark:border-dark-border"
      style={{
        height: CATEGORY_BAR_HEIGHT,
        transform: [{ translateY: categoryTranslateY }],
      }}
    >
      <ScrollView
        horizontal
        directionalLockEnabled
        alwaysBounceVertical={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          alignItems: "center",
          height: CATEGORY_BAR_HEIGHT,
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-accent border-accent"
                  : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const showSkeleton = isLoading && handouts.length === 0;

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* কাস্টম হেডার */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-2 border-b border-border dark:border-dark-border">
        <View>
          <Text className="text-2xl font-bold text-text dark:text-dark-text">
            Handouts
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/handouts/mine")}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
        >
          <Ionicons
            name="library-outline"
            size={19}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
      </View>

      {/* ক্যাটাগরি বার + কনটেন্ট — একই relative কন্টেইনারে, বার সবসময় ওভারলে হিসেবে থাকবে */}
      <View className="flex-1 relative">
        {CategoryBar}

        {/* Loading */}
        {showSkeleton && (
          <View
            className="px-4 gap-3"
            style={{ paddingTop: CATEGORY_BAR_HEIGHT + 12 }}
          >
            <HandoutCardSkeleton />
            <HandoutCardSkeleton />
            <HandoutCardSkeleton />
          </View>
        )}

        {/* Error */}
        {!showSkeleton && isError && (
          <View
            className="flex-1 items-center justify-center gap-4 px-6"
            style={{ paddingTop: CATEGORY_BAR_HEIGHT }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={isDark ? "#f87171" : "#ef4444"}
            />
            <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
              হ্যান্ডআউট লোড করা যায়নি
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="px-6 py-2 rounded-full bg-accent"
            >
              <Text className="text-white font-semibold text-sm">
                আবার চেষ্টা করুন
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!showSkeleton && !isError && handouts.length === 0 && (
          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={manualRefreshing}
                onRefresh={onManualRefresh}
                tintColor="#00914d"
                colors={["#00914d"]}
                progressViewOffset={CATEGORY_BAR_HEIGHT}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: CATEGORY_BAR_HEIGHT,
            }}
          >
            {renderListHeader()}
            <View className="flex-1 items-center justify-center gap-3 px-6 pb-20">
              <Ionicons
                name="document-text-outline"
                size={48}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
              <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
                এখনো কোনো হ্যান্ডআউট নেই
              </Text>
            </View>
          </ScrollView>
        )}

        {/* List */}
        {!showSkeleton && !isError && handouts.length > 0 && (
          <Animated.FlatList
            data={handouts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={renderSeparator}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={manualRefreshing}
                onRefresh={onManualRefresh}
                tintColor="#00914d"
                colors={["#00914d"]}
                progressViewOffset={CATEGORY_BAR_HEIGHT}
              />
            }
            contentContainerStyle={{
              paddingTop: CATEGORY_BAR_HEIGHT,
              paddingBottom: 90,
            }}
          />
        )}
      </View>

      {/* নতুন হ্যান্ডআউট তৈরির বাটন */}
      <TouchableOpacity
        onPress={() => router.push("/handouts/create")}
        activeOpacity={0.85}
        className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-accent items-center justify-center"
        style={{
          shadowColor: "#00914d",
          shadowOpacity: 0.35,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
