import {
  useGlobalSearchQuery,
  useSearchHandoutsInfiniteQuery,
  useSearchPostsInfiniteQuery,
  useSearchUsersInfiniteQuery,
  type SearchUser,
} from "@/redux/api/others/searchApi";
import type { Handout } from "@/types/handoutTypes";
import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import PostRow from "@/components/layout/search/PostRow";
import SearchEmptyState from "@/components/layout/search/SearchEmptyState";
import SearchInput from "@/components/layout/search/SearchInput";
import SearchTabBar, {
  type SearchTab,
} from "@/components/layout/search/SearchTabBar";
import HandoutCard from "@/components/ui/card/handout/HandoutCard"; // path nijer moto thik koro
import UserCard from "@/components/ui/card/user/UserCard";

type ListItem =
  | { type: "tab_bar" }
  | {
      type: "section_header";
      title: string;
      target: SearchTab;
      showSeeAll: boolean;
    }
  | { type: "post"; data: Post }
  | { type: "user"; data: SearchUser }
  | { type: "handout"; data: Handout }
  | { type: "no_results"; message: string }
  | { type: "loading" }
  | { type: "error" };

export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const listRef = useRef<FlatList<ListItem>>(null);

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  const hasQuery = !!submittedQuery;

  // ---------- queries (shudhu active tab-er ta cholbe) ----------
  const preview = useGlobalSearchQuery(
    { q: submittedQuery },
    { skip: !hasQuery || activeTab !== "all" },
  );
  const usersQ = useSearchUsersInfiniteQuery(
    { q: submittedQuery },
    { skip: !hasQuery || activeTab !== "accounts" },
  );
  const postsQ = useSearchPostsInfiniteQuery(
    { q: submittedQuery },
    { skip: !hasQuery || activeTab !== "posts" },
  );
  const handoutsQ = useSearchHandoutsInfiniteQuery(
    { q: submittedQuery },
    { skip: !hasQuery || activeTab !== "handouts" },
  );

  const active =
    activeTab === "all"
      ? preview
      : activeTab === "accounts"
        ? usersQ
        : activeTab === "posts"
          ? postsQ
          : handoutsQ;

  const isFetchingMore =
    (activeTab === "accounts" && usersQ.isFetchingNextPage) ||
    (activeTab === "posts" && postsQ.isFetchingNextPage) ||
    (activeTab === "handouts" && handoutsQ.isFetchingNextPage);

  // isFetching use korsi, jate notun query-te purono data na dekhay
  const isLoading = active.isFetching && !isFetchingMore;
  const isError = active.isError;

  // ---------- handlers ----------
  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setSubmittedQuery(trimmed);
    setActiveTab("all");
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery("");
    setSubmittedQuery("");
    setActiveTab("all");
  }, []);

  const handleTabChange = useCallback((tab: SearchTab) => {
    setActiveTab(tab);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const handleEndReached = () => {
    if (activeTab === "accounts") {
      if (usersQ.hasNextPage && !usersQ.isFetchingNextPage) {
        usersQ.fetchNextPage();
      }
    } else if (activeTab === "posts") {
      if (postsQ.hasNextPage && !postsQ.isFetchingNextPage) {
        postsQ.fetchNextPage();
      }
    } else if (activeTab === "handouts") {
      if (handoutsQ.hasNextPage && !handoutsQ.isFetchingNextPage) {
        handoutsQ.fetchNextPage();
      }
    }
  };

  // ---------- list data ----------
  const listData = useMemo((): ListItem[] => {
    if (!hasQuery) return [];
    const items: ListItem[] = [{ type: "tab_bar" }];

    if (isLoading) {
      items.push({ type: "loading" });
      return items;
    }
    if (isError) {
      items.push({ type: "error" });
      return items;
    }

    if (activeTab === "all") {
      const users = preview.data?.users ?? [];
      const posts = preview.data?.posts ?? [];
      const handouts = preview.data?.handouts ?? [];
      const hasMore = preview.data?.hasMore;

      if (users.length > 0) {
        items.push({
          type: "section_header",
          title: t("searchData.sectionAccounts"),
          target: "accounts",
          showSeeAll: !!hasMore?.users,
        });
        users.forEach((u) => items.push({ type: "user", data: u }));
      }
      if (handouts.length > 0) {
        items.push({
          type: "section_header",
          title: t("searchData.sectionHandouts"),
          target: "handouts",
          showSeeAll: !!hasMore?.handouts,
        });
        handouts.forEach((h) => items.push({ type: "handout", data: h }));
      }
      if (posts.length > 0) {
        items.push({
          type: "section_header",
          title: t("searchData.sectionPosts"),
          target: "posts",
          showSeeAll: !!hasMore?.posts,
        });
        posts.forEach((p) => items.push({ type: "post", data: p }));
      }
      if (users.length + posts.length + handouts.length === 0) {
        items.push({
          type: "no_results",
          message: t("searchData.noResults"),
        });
      }
      return items;
    }

    if (activeTab === "accounts") {
      const users = usersQ.data?.pages.flatMap((p) => p.items) ?? [];
      if (users.length === 0) {
        items.push({
          type: "no_results",
          message: t("searchData.noAccounts"),
        });
      } else {
        users.forEach((u) => items.push({ type: "user", data: u }));
      }
      return items;
    }

    if (activeTab === "posts") {
      const posts = postsQ.data?.pages.flatMap((p) => p.items) ?? [];
      if (posts.length === 0) {
        items.push({ type: "no_results", message: t("searchData.noPosts") });
      } else {
        posts.forEach((p) => items.push({ type: "post", data: p }));
      }
      return items;
    }

    const handouts = handoutsQ.data?.pages.flatMap((p) => p.items) ?? [];
    if (handouts.length === 0) {
      items.push({ type: "no_results", message: t("searchData.noHandouts") });
    } else {
      handouts.forEach((h) => items.push({ type: "handout", data: h }));
    }
    return items;
  }, [
    hasQuery,
    isLoading,
    isError,
    activeTab,
    preview.data,
    usersQ.data,
    postsQ.data,
    handoutsQ.data,
    t,
  ]);

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case "tab_bar":
        return (
          <SearchTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        );

      case "section_header":
        return (
          <View className="flex-row items-center justify-between px-4 pt-5 pb-2">
            <Text className="text-base font-bold text-text dark:text-dark-text">
              {item.title}
            </Text>
            {item.showSeeAll && (
              <TouchableOpacity
                onPress={() => handleTabChange(item.target)}
                hitSlop={8}
              >
                <Text className="text-sm font-semibold text-accent">
                  {t("searchData.seeAll")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "user":
        return <UserCard user={item.data} />;

      case "post":
        return <PostRow post={item.data} />;

      case "handout":
        return (
          <View className="py-2">
            <HandoutCard handout={item.data} />
          </View>
        );

      case "loading":
        return (
          <View className="items-center pt-16">
            <ActivityIndicator size="large" color="#00914d" />
          </View>
        );

      case "error":
        return (
          <View className="items-center pt-16 gap-3 px-8">
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={isDark ? "#2e2e2e" : "#E5E7EB"}
            />
            <Text className="text-[13px] text-center text-text-tertiary dark:text-dark-text-tertiary">
              {t("searchData.error")}
            </Text>
            <TouchableOpacity
              onPress={() => active.refetch()}
              activeOpacity={0.8}
              className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
            >
              <Text className="text-sm font-semibold text-text dark:text-dark-text">
                {t("searchData.retry")}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "no_results":
        return (
          <View className="items-center pt-16 gap-2.5">
            <Ionicons
              name="search-outline"
              size={40}
              color={isDark ? "#2e2e2e" : "#E5E7EB"}
            />
            <Text className="text-[13px] text-text-tertiary dark:text-dark-text-tertiary">
              {item.message}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const keyExtractor = (item: ListItem, index: number) => {
    if (item.type === "post") return `post-${item.data._id}`;
    if (item.type === "user") return `user-${item.data._id}`;
    if (item.type === "handout") return `handout-${item.data._id}`;
    if (item.type === "section_header") return `header-${item.target}`;
    return `${item.type}-${index}`;
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* Header */}
      <View className="bg-background dark:bg-dark-background px-4 pb-3 gap-2.5 pt-3">
        <SearchInput
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSearch}
          onClear={handleClear}
        />
      </View>

      {/* Body */}
      {!hasQuery ? (
        <SearchEmptyState
          icon="search-outline"
          message={t("searchData.emptyHint")}
        />
      ) : (
        <FlatList
          ref={listRef}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          ListFooterComponent={
            isFetchingMore ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#00914d" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
