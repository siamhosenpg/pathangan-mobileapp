import ErrorState from "@/components/error/ErrorState";
import HandoutCard from "@/components/ui/card/handout/HandoutCard";
import HandoutCardSkeleton from "@/components/ui/card/handout/HandoutCardSkeleton";

import {
  useGetAllHandoutsInfiniteInfiniteQuery,
  useGetMyHandoutsQuery,
} from "@/redux/api/handout/handoutApi";
import type { Handout, HandoutCategory } from "@/types/handoutTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_KEYS: (HandoutCategory | null)[] = [
  null,
  "golpo",
  "itihash",
  "dharmiyo",
  "kobita",
  "ovizoggota",
  "onnanno",
];

const CATEGORY_BAR_HEIGHT = 56;
const HIDE_SHOW_THRESHOLD = 6;

// net ache kina check kori. null (ekhono jani na) hole online dhori,
// shudhu shpostho vabe offline hole false dei
const isOnline = async () => {
  const net = await NetInfo.fetch();
  return !(net.isConnected === false || net.isInternetReachable === false);
};

function DraftStrip({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();

  const { data, refetch } = useGetMyHandoutsQuery({ status: "draft" });
  const drafts = data?.data ?? [];

  // ফিড স্ক্রিন focus হলে draft strip নিঃশব্দে (background এ) রিফ্রেশ হবে
  // net na thakle refetch chalabo na
  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (await isOnline()) refetch();
      })();
    }, [refetch]),
  );

  if (drafts.length === 0) return null;

  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-yellow-500" />
          <Text className="text-sm font-bold text-text dark:text-dark-text">
            {t("handoutData.draftsTitle")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/handouts/mine")}
          hitSlop={8}
        >
          <Text className="text-xs font-semibold text-accent">
            {t("handoutData.seeAll")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {drafts.map((item) => (
          <TouchableOpacity
            key={item._id}
            activeOpacity={0.85}
            onPress={() => router.push(`/handouts/manage/${item._id}`)}
            className="w-44 rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
          >
            <View className="w-full h-28 bg-background-tertiary dark:bg-dark-background-tertiary">
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
                    size={24}
                    color={isDark ? "#4b5563" : "#9ca3af"}
                  />
                </View>
              )}
              <View className="absolute top-2 left-2 bg-yellow-500 px-2.5 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-white">
                  {t("handoutData.status.draft")}
                </Text>
              </View>
            </View>
            <View className="p-3 gap-1">
              <Text
                numberOfLines={1}
                className="text-sm font-bold text-text dark:text-dark-text"
              >
                {item.title}
              </Text>
              <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
                {t("handoutData.chapters", { value: item.chaptersCount })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function HandoutsFeedScreen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeCategory, setActiveCategory] = useState<HandoutCategory | null>(
    null,
  );
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useGetAllHandoutsInfiniteInfiniteQuery({ category: activeCategory });

  const handouts: Handout[] = data?.pages?.flatMap((page) => page.data) ?? [];

  // ট্যাব ফোকাস হলে ডেটা নিঃশব্দে (background এ) রিফ্রেশ হয়
  // net na thakle refetch chalabo na
  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (await isOnline()) refetch();
      })();
    }, [refetch]),
  );

  const onManualRefresh = useCallback(async () => {
    if (!(await isOnline())) return;

    setManualRefreshing(true);
    try {
      const result = await refetch();

      // refresh fail holeo purono handout gulo thakbe, shudhu user ke jani
      if (result.isError && handouts.length > 0) {
        Alert.alert(
          t("handoutData.refreshFailedTitle"),
          getErrorMessage(result.error),
        );
      }
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch, handouts.length, t]);

  const renderItem = useCallback(
    ({ item }: { item: Handout }) => <HandoutCard handout={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Handout) => item._id, []);

  const renderSeparator = useCallback(() => <View className="h-3" />, []);

  const renderFooter = useCallback(() => {
    // 1) next page ashchhe -> skeleton
    if (isFetchingNextPage) {
      return (
        <View className="pt-3">
          <HandoutCardSkeleton />
        </View>
      );
    }

    // 2) next page fail -> purono handout thakbe, niche shudhu chhoto retry
    if (isFetchNextPageError) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            {t("handoutData.loadMoreFailed")}
          </Text>
          <TouchableOpacity
            onPress={() => fetchNextPage()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {t("handoutData.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, isFetchNextPageError, fetchNextPage, t]);

  const handleEndReached = useCallback(() => {
    // next page er error thakle nije nije abar chalabo na
    if (isFetchNextPageError) return;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  // Scroll করলে ক্যাটাগরি বার লুকাবে/দেখাবে
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
        {CATEGORY_KEYS.map((key) => {
          const isActive = activeCategory === key;
          return (
            <TouchableOpacity
              key={key ?? "all"}
              onPress={() => setActiveCategory(key)}
              activeOpacity={0.8}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-accent border-accent"
                  : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                {key
                  ? t(`handoutData.categories.${key}`)
                  : t("handoutData.all")}
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
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-border dark:border-dark-border">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold text-text dark:text-dark-text">
            {t("handoutData.title")}
          </Text>
          <Text
            numberOfLines={1}
            className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5"
          >
            {t("handoutData.subtitle")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/handouts/mine")}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("handoutData.myHandouts")}
          className="w-11 h-11 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
        >
          <Ionicons
            name="library-outline"
            size={19}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
      </View>

      {/* ক্যাটাগরি বার + কনটেন্ট */}
      <View className="flex-1 relative">
        {CategoryBar}

        {/* Loading */}
        {showSkeleton && (
          <View
            className="gap-3"
            style={{ paddingTop: CATEGORY_BAR_HEIGHT + 12 }}
          >
            <HandoutCardSkeleton />
            <HandoutCardSkeleton />
            <HandoutCardSkeleton />
          </View>
        )}

        {/* Error — শুধু তখনই full-screen, যখন দেখানোর মতো একটা handout-ও নেই */}
        {!showSkeleton && isError && handouts.length === 0 && (
          <View className="flex-1" style={{ paddingTop: CATEGORY_BAR_HEIGHT }}>
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
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
              <View className="w-20 h-20 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary">
                <Ionicons
                  name="document-text-outline"
                  size={36}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
              </View>
              <Text className="text-base font-semibold text-center text-text dark:text-dark-text">
                {t("handoutData.empty")}
              </Text>
              <Text className="text-sm text-center text-text-tertiary dark:text-dark-text-tertiary">
                {t("handoutData.emptyHint")}
              </Text>
            </View>
          </ScrollView>
        )}

        {/* List */}
        {!showSkeleton && handouts.length > 0 && (
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
              paddingBottom: 100,
            }}
          />
        )}
      </View>

      {/* নতুন হ্যান্ডআউট তৈরির বাটন */}
      <TouchableOpacity
        onPress={() => router.push("/handouts/create")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("handoutData.newHandout")}
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
