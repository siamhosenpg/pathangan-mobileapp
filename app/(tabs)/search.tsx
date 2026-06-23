import type { SearchUser } from "@/redux/api/others/searchApi";
import { useGlobalSearchQuery } from "@/redux/api/others/searchApi";
import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import PostRow from "@/components/layout/search/PostRow";
import SearchEmptyState from "@/components/layout/search/SearchEmptyState";
import SearchInput from "@/components/layout/search/SearchInput";
import SearchSectionHeader from "@/components/layout/search/SearchSectionHeader";
import SearchTabBar, {
  SearchTab,
} from "@/components/layout/search/SearchTabBar";
import UserCard from "@/components/ui/card/user/UserCard";

type ListItem =
  | { type: "tab_bar" }
  | { type: "section_header"; title: string; count: number }
  | { type: "post"; data: Post }
  | { type: "user"; data: SearchUser }
  | { type: "no_results"; message: string };

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  const { data, isLoading, isError } = useGlobalSearchQuery(submittedQuery, {
    skip: !submittedQuery,
  });

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setSubmittedQuery(trimmed);
    setActiveTab("all");
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
  };

  const posts = data?.posts ?? [];
  const users = data?.users ?? [];

  const buildListData = (): ListItem[] => {
    if (!submittedQuery) return [];
    const items: ListItem[] = [{ type: "tab_bar" }];
    if (isLoading || isError) return items;

    if (activeTab === "all") {
      if (users.length > 0) {
        items.push({
          type: "section_header",
          title: "অ্যাকাউন্ট",
          count: users.length,
        });
        users.forEach((u) => items.push({ type: "user", data: u }));
      }
      if (posts.length > 0) {
        items.push({
          type: "section_header",
          title: "পোস্ট",
          count: posts.length,
        });
        posts.forEach((p) => items.push({ type: "post", data: p }));
      }
      if (users.length === 0 && posts.length === 0) {
        items.push({ type: "no_results", message: "কোনো ফলাফল পাওয়া যায়নি" });
      }
    } else if (activeTab === "posts") {
      if (posts.length > 0) {
        posts.forEach((p) => items.push({ type: "post", data: p }));
      } else {
        items.push({ type: "no_results", message: "কোনো পোস্ট পাওয়া যায়নি" });
      }
    } else if (activeTab === "accounts") {
      if (users.length > 0) {
        users.forEach((u) => items.push({ type: "user", data: u }));
      } else {
        items.push({
          type: "no_results",
          message: "কোনো অ্যাকাউন্ট পাওয়া যায়নি",
        });
      }
    }

    return items;
  };

  const listData = buildListData();

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "tab_bar") {
      return <SearchTabBar activeTab={activeTab} onTabChange={setActiveTab} />;
    }
    if (item.type === "section_header") {
      return <SearchSectionHeader title={item.title} count={item.count} />;
    }
    if (item.type === "user") return <UserCard user={item.data} />;
    if (item.type === "post") return <PostRow post={item.data} />;
    if (item.type === "no_results") {
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
    }
    return null;
  };

  const keyExtractor = (item: ListItem, index: number) => {
    if (item.type === "post") return `post-${item.data._id}`;
    if (item.type === "user") return `user-${item.data._id}`;
    return `${item.type}-${index}`;
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background-secondary dark:bg-dark-background-secondary"
    >
      {/* Header */}
      <View className="bg-background dark:bg-dark-background  px-4 pb-3 gap-2.5 pt-3">
        <SearchInput
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSearch}
          onClear={handleClear}
        />
      </View>

      {/* Body */}
      {!submittedQuery ? (
        <SearchEmptyState
          icon="search-outline"
          message="কিছু লিখে সার্চ করুন"
        />
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00914d" />
        </View>
      ) : isError ? (
        <SearchEmptyState
          icon="alert-circle-outline"
          message="সার্চ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
        />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          stickyHeaderIndices={[0]}
        />
      )}
    </SafeAreaView>
  );
}
