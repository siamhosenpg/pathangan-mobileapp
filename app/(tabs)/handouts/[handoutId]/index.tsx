import GreenMark from "@/components/ui/badges/GreenMark";
import TimeAgo from "@/components/ui/datetime/TimeAgo";
import { useGetHandoutBySlugQuery } from "@/redux/api/handout/handoutApi";
import { toBanglaNumber } from "@/utils/toBanglaNumber";
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

const categoryLabels: Record<string, string> = {
  golpo: "গল্প",
  itihash: "ইতিহাস",
  dharmiyo: "ধর্মীয়",
  kobita: "কবিতা",
  ovizoggota: "অভিজ্ঞতা",
  onnanno: "অন্যান্য",
};

export default function HandoutDetailScreen() {
  // নোট: এই param আসলে handout.slug — নাম শুধু route ফোল্ডার অনুযায়ী "handoutId"
  const { handoutId: slug } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const n = (num: number) => (isBn ? toBanglaNumber(num) : String(num));

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
          হ্যান্ডআউট পাওয়া যায়নি
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="px-6 py-2 rounded-full bg-accent"
        >
          <Text className="text-white font-semibold text-sm">
            আবার চেষ্টা করুন
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
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5">
          {/* কভার (বামে) + টাইটেল/ক্যাটাগরি/ইউজার (ডানে) */}
          <View className="flex-row gap-4">
            <View className="w-28 aspect-[2/3] rounded-xl overflow-hidden bg-background-tertiary dark:bg-dark-background-tertiary">
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
                    {categoryLabels[handout.category] ?? handout.category}
                  </Text>
                </View>
                {handout.status === "draft" && (
                  <View className="bg-yellow-500/15 px-3 py-1 rounded-full self-start">
                    <Text className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                      ড্রাফট
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
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text
                      numberOfLines={1}
                      className="text-xs font-semibold text-text dark:text-dark-text"
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

          <View className="pt-5 gap-4">
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
            <View className="flex-row items-center justify-between bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3">
              <View className="items-center gap-1">
                <Ionicons name="reader-outline" size={18} color="#00914d" />
                <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {n(handout.chaptersCount)} অধ্যায়
                </Text>
              </View>
              <View className="items-center gap-1">
                <Ionicons name="time-outline" size={18} color="#00914d" />
                <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {n(handout.estimatedReadTime)} মিনিট
                </Text>
              </View>
              <View className="items-center gap-1">
                <Ionicons name="eye-outline" size={18} color="#00914d" />
                <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {n(handout.readCount)} পঠিত
                </Text>
              </View>
              <View className="items-center gap-1">
                <Ionicons name="heart-outline" size={18} color="#00914d" />
                <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {n(handout.likesCount)}
                </Text>
              </View>
            </View>

            {/* Table of Contents */}
            <Text className="text-lg font-bold text-text dark:text-dark-text mt-2">
              অধ্যায়সমূহ
            </Text>

            <View className="gap-2">
              {handout.chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter._id}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push(`/handouts/${slug}/chapter/${chapter._id}`)
                  }
                  className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-xl px-4 py-3 border border-border dark:border-dark-border"
                >
                  <View className="w-8 h-8 rounded-full bg-accent-transparent items-center justify-center">
                    <Text className="text-accent text-xs font-bold">
                      {n(index + 1)}
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
                      {n(chapter.wordCount)} শব্দ
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
