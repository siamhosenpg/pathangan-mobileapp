import CourseCard from "@/components/ui/card/course/CourseCard";
import { Header } from "@/components/ui/headers/Header";
import type { Course } from "@/redux/api/post/courseApi";
import { useGetAllCoursesInfiniteQuery } from "@/redux/api/post/courseApi";
import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function CoursesPage() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetAllCoursesInfiniteQuery({ limit: 10 });

  const courses: Course[] = data?.pages?.flatMap((page) => page.courses) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard post={item as unknown as Post} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Course) => item._id, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator
          size="small"
          color={isDark ? "#f1f1f1" : "#1b1b1b"}
        />
      </View>
    );
  }, [isFetchingNextPage, isDark]);

  const renderSeparator = useCallback(
    () => <View className="h-[1px] bg-border dark:bg-dark-border mx-4" />,
    [],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <Header title={t("courses")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <Header title={t("courses")} />
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={isDark ? "#f87171" : "#ef4444"}
          />
          <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
            {t("failed_to_load_courses")}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="px-6 py-2 rounded-full bg-accent"
          >
            <Text className="text-white font-semibold text-sm">
              {t("try_again")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <Header title={t("courses")} />
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Ionicons
            name="book-outline"
            size={48}
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
          <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
            {t("noCourses")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <Header title={t("courses")} />

      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}
