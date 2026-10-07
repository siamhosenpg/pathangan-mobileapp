import GreenMark from "@/components/ui/badges/GreenMark";
import TimeAgo from "@/components/ui/datetime/TimeAgo";
import BackHeader from "@/components/ui/headers/BackHeader";
import { useGetHandoutBySlugQuery } from "@/redux/api/handout/handoutApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const StatItem = ({ icon, label }: StatItemProps) => (
  <View className="items-center gap-1.5 flex-1">
    <Ionicons name={icon} size={18} color="#00914d" />
    <Text
      numberOfLines={1}
      className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary"
    >
      {label}
    </Text>
  </View>
);

export default function HandoutDetailScreen() {
  const { t } = useTranslation();
  // নোট: এই param আসলে handout.slug — নাম শুধু route ফোল্ডার অনুযায়ী "handoutId"
  const { handoutId: slug } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data, isLoading, isError, refetch } = useGetHandoutBySlugQuery(
    slug ?? "",
    {
      skip: !slug,
    },
  );

  const handout = data?.data;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#00914d" />
      </SafeAreaView>
    );
  }

  if (isError || !handout) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 px-6 bg-background dark:bg-dark-background">
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={isDark ? "#f87171" : "#ef4444"}
        />
        <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
          {t("handoutData.notFound")}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="px-6 py-2.5 rounded-full bg-accent"
        >
          <Text className="text-white font-semibold text-sm">
            {t("handoutData.retry")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* কাস্টম টপ বার */}
      <BackHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
      >
        <View className="px-5">
          {/* কভার (বামে) + টাইটেল/ক্যাটাগরি/ইউজার (ডানে) */}
          <View className="flex-row gap-4">
            <View className="w-28 aspect-[2/3] rounded-2xl overflow-hidden bg-background-tertiary dark:bg-dark-background-tertiary">
              {handout.coverImage ? (
                <Image
                  source={{ uri: handout.coverImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons
                    name="book-outline"
                    size={32}
                    color={isDark ? "#4b5563" : "#9ca3af"}
                  />
                </View>
              )}
            </View>

            <View className="flex-1 justify-center gap-3">
              {/* টাইটেল */}
              <Text
                numberOfLines={3}
                className="text-lg font-bold text-text dark:text-dark-text leading-6"
              >
                {handout.title}
              </Text>

              {/* ক্যাটাগরি ব্যাজ */}
              <View className="flex-row items-center gap-2">
                <View className="bg-accent-transparent px-3 py-1 rounded-full self-start">
                  <Text className="text-accent text-xs font-semibold">
                    {t(`handoutData.categories.${handout.category}`, {
                      defaultValue: handout.category,
                    })}
                  </Text>
                </View>
                {handout.status === "draft" && (
                  <View className="bg-yellow-500/15 px-3 py-1 rounded-full self-start">
                    <Text className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                      {t("handoutData.status.draft")}
                    </Text>
                  </View>
                )}
              </View>

              {/* লেখক + সময় */}
              <View className="flex-row items-center gap-2">
                {handout.user?.profileImage ? (
                  <Image
                    source={{ uri: handout.user.profileImage }}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <View className="w-7 h-7 rounded-full bg-accent-transparent items-center justify-center">
                    <Ionicons name="person" size={13} color="#00914d" />
                  </View>
                )}
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text
                      numberOfLines={1}
                      className="text-xs font-semibold text-text dark:text-dark-text flex-shrink"
                    >
                      {handout.user?.name ?? handout.user?.username}
                    </Text>
                    <GreenMark
                      mark={handout.user?.greenmarkVerified}
                      size={13}
                    />
                  </View>
                  {handout.publishedAt && (
                    <TimeAgo
                      date={handout.publishedAt}
                      className="text-[10px] text-text-tertiary dark:text-dark-text-tertiary"
                    />
                  )}
                </View>
              </View>
            </View>
          </View>

          <View className="pt-6 gap-5">
            {/* বর্ণনা */}
            <Text className="text-sm text-text-secondary dark:text-dark-text-secondary leading-6">
              {handout.description}
            </Text>

            {/* ট্যাগ */}
            {handout.tags?.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {handout.tags.map((tag) => (
                  <View
                    key={tag}
                    className="px-3 py-1 rounded-full bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
                  >
                    <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* স্ট্যাটস */}
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-3xl px-2 py-4">
              <StatItem
                icon="reader-outline"
                label={t("handoutData.chapters", {
                  value: handout.chaptersCount,
                })}
              />
              <StatItem
                icon="time-outline"
                label={t("handoutData.minutes", {
                  value: handout.estimatedReadTime,
                })}
              />
              <StatItem
                icon="eye-outline"
                label={t("handoutData.reads", { value: handout.readCount })}
              />
              <StatItem
                icon="heart-outline"
                label={String(handout.likesCount)}
              />
            </View>

            {/* Table of Contents */}
            <Text className="text-lg font-bold text-text dark:text-dark-text">
              {t("handoutData.chaptersHeading")}
            </Text>

            <View className="gap-2.5">
              {handout.chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter._id}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push(`/handouts/${slug}/chapter/${chapter._id}`)
                  }
                  className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3.5 border border-border dark:border-dark-border"
                >
                  <View className="w-9 h-9 rounded-full bg-accent-transparent items-center justify-center">
                    <Text className="text-accent text-sm font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-sm font-semibold text-text dark:text-dark-text"
                    >
                      {chapter.title}
                    </Text>
                    <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                      {t("handoutData.words", { value: chapter.wordCount })}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? "#8a8a8a" : "#6d6d6d"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
