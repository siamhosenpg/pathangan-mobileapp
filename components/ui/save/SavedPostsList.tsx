import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import { SavedCollectionContext } from "@/contexts/SavedCollectionContext";
import {
  useGetSavedItemsInfiniteQuery,
  type SavedItem,
} from "@/redux/api/save/savedItemApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

interface Props {
  collectionId: string;
}

export function SavedPostsList({ collectionId }: Props) {
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetSavedItemsInfiniteQuery(collectionId, { skip: !collectionId });

  const [refreshing, setRefreshing] = useState(false);

  // ── Video visibility state ──
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const lastVisibleIndexRef = useRef<number | null>(null);

  // ভেতরের বুকমার্ক বাটন যেন জানে এখন কোন কালেকশন খোলা
  const contextValue = useMemo(() => ({ collectionId }), [collectionId]);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  // screen থেকে চলে গেলে সব video pause, ফিরে এলে আগের index restore
  useFocusEffect(
    useCallback(() => {
      setVisibleIndex(lastVisibleIndexRef.current);
      return () => {
        setVisibleIndex(null);
      };
    }, []),
  );

  // কোনো পোস্ট ডিলিট হয়ে গেলে একটা পেজ পুরো খালি আসতে পারে,
  // তখন scroll event আসবে না — তাই নিজে থেকেই পরের পেজ আনি
  useEffect(() => {
    if (!isLoading && !isFetching && items.length === 0 && hasNextPage) {
      fetchNextPage();
    }
  }, [isLoading, isFetching, items.length, hasNextPage, fetchNextPage]);

  const handleEndReached = () => {
    if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage();
  };

  // উপরে টেনে নামালে রিফ্রেশ
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    lastVisibleIndexRef.current = null;
    setVisibleIndex(null);
    try {
      await refetch();
    } catch {
      // error হলে আগের data-ই থাকবে
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // ── Viewability: FlatList এ এই দুটো অবশ্যই stable (useRef) হতে হবে ──
  const viewabilityConfigRef = useRef({ itemVisiblePercentThreshold: 60 });

  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const visible = viewableItems.find((v) => v.isViewable);
      const index = visible?.index ?? null;
      lastVisibleIndexRef.current = index;
      setVisibleIndex(index);
    },
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SavedItem; index: number }) => {
      const post = item.postId;
      if (!post) return null;

      if (post.postType === "question") return <QuestionCard post={post} />;
      if (post.postType === "course") return <CourseCardFeed post={post} />;

      const isVideoVisible = visibleIndex === index;
      const isNearVisible =
        visibleIndex !== null && Math.abs(index - visibleIndex) <= 3;

      return (
        <Postcard
          post={post}
          isVideoVisible={isVideoVisible}
          isVideoNearVisible={isNearVisible}
        />
      );
    },
    [visibleIndex],
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#00914d" />
        </View>
      );
    }
    if (!hasNextPage && items.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
            {t("saveData.noMore")}
          </Text>
        </View>
      );
    }
    return null;
  };

  // লোডিং / এরর / খালি — সব অবস্থায় FlatList থাকে, তাই refresh কাজ করে
  const renderEmpty = () => {
    if (isLoading || (items.length === 0 && hasNextPage)) {
      return (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#00914d" />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="items-center justify-center py-16">
          <Ionicons name="alert-circle-outline" size={40} color="#6d6d6d" />
          <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm mt-3">
            {t("saveData.loadFailed")}
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-16">
        <Ionicons name="bookmark-outline" size={44} color="#dddddd" />
        <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm mt-3">
          {t("saveData.emptyCollection")}
        </Text>
      </View>
    );
  };

  return (
    <SavedCollectionContext.Provider value={contextValue}>
      <FlatList
        data={items}
        extraData={visibleIndex}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        viewabilityConfig={viewabilityConfigRef.current}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 128 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00914d"
            colors={["#00914d"]}
          />
        }
      />
    </SavedCollectionContext.Provider>
  );
}
