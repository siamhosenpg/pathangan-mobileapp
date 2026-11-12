import OptimizedImage from "@/components/ui/avatar/OptimizedImage";
import ProfileImage from "@/components/ui/avatar/ProfileImage";
import GreenMark from "@/components/ui/badges/GreenMark";
import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import ContentMenuSheet, {
  SHARE_BASE_URL,
} from "@/components/ui/bottom-sheet/report/ContentMenuSheet"; // তোমার আসল path দাও
import TimeAgo from "@/components/ui/datetime/TimeAgo";
import TextFont from "@/components/ui/font/TextFont";
import StarRating from "@/components/ui/rating/StarRating"; // তোমার আসল path দাও
import { useGetHandoutBySlugQuery } from "@/redux/api/handout/handoutApi";
import { useGetHandoutRatingQuery } from "@/redux/api/rating/chapterRatingApi";
import { HANDOUT_STATUS_STYLE } from "@/utils/handout/handoutStatus";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
  <View className="items-center gap-1.5 flex-1 flex-row justify-center">
    <Ionicons name={icon} size={18} color="#111" />
    <Text
      numberOfLines={1}
      className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary"
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
  const { open } = useBottomSheet();

  const { data, isLoading, isError, refetch } = useGetHandoutBySlugQuery(
    slug ?? "",
    {
      skip: !slug,
    },
  );

  const handout = data?.data;
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  // chapter গুলোর rating এর average (chapter এ rating দিলে নিজে থেকে update হবে)
  const { data: ratingData } = useGetHandoutRatingQuery(handout?._id ?? "", {
    skip: !handout?._id,
  });
  const averageRating = ratingData?.averageRating ?? 0;
  const ratingCount = ratingData?.ratingCount ?? 0;

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

  // published ছাড়া অন্য status শুধু owner দেখতে পায় (সার্ভার অন্যদের 404 দেয়)
  const isNotPublished = handout.status !== "published";
  const statusStyle = HANDOUT_STATUS_STYLE[handout.status];
  const showHiddenNotice =
    handout.status === "auto_hidden" || handout.status === "under_review";

  // ৩ ডট চাপলে menu sheet খুলবে (copy link + report)
  const openMenu = () => {
    open(
      <ContentMenuSheet
        targetType="handout"
        targetId={handout._id}
        shareUrl={`${SHARE_BASE_URL}/handouts/${handout.slug}`}
      />,
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* কাস্টম টপ বার: বামে back, ডানে ৩ ডট */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="arrow-back" size={20} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openMenu}
          accessibilityRole="button"
          hitSlop={8}
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="ellipsis-vertical" size={18} color={iconColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
      >
        <View className="">
          {/* auto_hidden / under_review হলে owner কে কারণ জানাই */}
          {showHiddenNotice && (
            <View
              className={`mx-5 mb-4 flex-row items-start gap-2.5 p-3.5 rounded-2xl border ${statusStyle.border} ${statusStyle.badge}`}
            >
              <Ionicons
                name={
                  handout.status === "auto_hidden"
                    ? "warning-outline"
                    : "time-outline"
                }
                size={18}
                color={handout.status === "auto_hidden" ? "#ef4444" : "#f97316"}
              />
              <Text
                className={`flex-1 text-xs font-medium leading-5 ${statusStyle.text}`}
              >
                {handout.status === "auto_hidden"
                  ? t("handoutData.autoHiddenNotice")
                  : t("handoutData.underReviewNotice")}
              </Text>
            </View>
          )}

          {/* কভার (বামে) + টাইটেল/ক্যাটাগরি/ইউজার (ডানে) */}
          <View className="flex-row gap-4 px-5">
            <OptimizedImage
              uri={handout.coverImage}
              width={96}
              aspectRatio={2 / 3}
              radius={16}
              fallbackIcon="book-outline"
              recyclingKey={handout.slug}
            />

            <View className="flex-1 justify-center gap-3">
              {/* টাইটেল */}
              <TextFont
                numberOfLines={3}
                className="text-lg font-bold text-text dark:text-dark-text leading-6"
              >
                {handout.title}
              </TextFont>
              {/* ✅ handout এর rating (chapter rating গুলোর average) */}
              <View className="flex-row items-center gap-3">
                <StarRating rating={averageRating} size={16} />
                {ratingCount > 0 ? (
                  <View className="flex-row items-center gap-1">
                    <Text className="text-sm font-semibold text-text dark:text-dark-text">
                      {averageRating.toFixed(1)}
                    </Text>
                    <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                      {t("ratingData.ratingCount", { value: ratingCount })}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    {t("handoutData.noRatings", {
                      defaultValue: "এখনো কোনো রেটিং নেই",
                    })}
                  </Text>
                )}
              </View>

              {/* ক্যাটাগরি ব্যাজ + status ব্যাজ (published না হলে) */}
              <View className="flex-row items-center gap-2 flex-wrap">
                <View className="border-accent  border  px-3 py-1 rounded-full self-start">
                  <TextFont className="text-accent text-xs font-semibold">
                    {t(`handoutData.categories.${handout.category}`, {
                      defaultValue: handout.category,
                    })}
                  </TextFont>
                </View>
                {isNotPublished && (
                  <View
                    className={`border px-3 py-1 rounded-full self-start ${statusStyle.border}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${statusStyle.text}`}
                    >
                      {t(`handoutData.status.${handout.status}`)}
                    </Text>
                  </View>
                )}
              </View>

              {/* লেখক + সময় */}
              <View className="flex-row items-center gap-2">
                <ProfileImage
                  uri={handout.user?.profileImage}
                  name={handout.user?.name ?? handout.user?.username}
                  size={28}
                  bordered={false}
                />

                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <TextFont
                      numberOfLines={1}
                      className="text-xs font-semibold text-text dark:text-dark-text flex-shrink"
                    >
                      {handout.user?.name ?? handout.user?.username}
                    </TextFont>
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

          <View className="pt-6 ">
            {/* বর্ণনা */}
            <TextFont className="text-sm pb-2 font-medium text-text-secondary dark:text-dark-text-secondary leading-6  px-5">
              {handout.description}
            </TextFont>

            {/* ট্যাগ */}
            {handout.tags?.length > 0 && (
              <View className="flex-row flex-wrap gap-2 px-5 py-3">
                {handout.tags.map((tag) => (
                  <View
                    key={tag}
                    className="px-3 py-1 rounded-full  bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
                  >
                    <TextFont className="text-xs font-semibold text-text-tertiary dark:text-dark-text-tertiary">
                      #{tag}
                    </TextFont>
                  </View>
                ))}
              </View>
            )}
            <View className="border-t border-border/35 dark:border-dark-border/35" />

            {/* স্ট্যাটস */}
            <View className="flex-row items-center   border-b border-border dark:border-dark-border  px-2 py-3">
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
            <Text className=" font-bold text-text border-b border-border/50 dark:border-dark-border/50 dark:text-dark-text px-5 py-3.5  text-base">
              {t("handoutData.chaptersHeading")}
            </Text>

            <View className="">
              {handout.chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter._id}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push(`/handouts/${slug}/chapter/${chapter._id}`)
                  }
                  className="flex-row items-center gap-3  px-4 py-3 border-b border-border/50 dark:border-dark-border/50"
                >
                  <View className="w-9 h-9 rounded-full  bg-accent/20   items-center justify-center">
                    <Text className="text-text-secondary dark:text-dark-text-secondary  text-sm font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <TextFont
                      numberOfLines={1}
                      className="text-sm font-semibold text-text dark:text-dark-text"
                    >
                      {chapter.title}
                    </TextFont>
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
