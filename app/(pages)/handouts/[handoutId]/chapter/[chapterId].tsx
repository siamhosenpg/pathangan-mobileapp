import { useGetChaptersByHandoutQuery } from "@/redux/api/handout/chapterApi";
import { useGetHandoutBySlugQuery } from "@/redux/api/handout/handoutApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FONT_SIZES = [14, 15, 17, 19, 22];

export default function ChapterReaderScreen() {
  // route এ handoutId আসলে slug
  const { handoutId: slug, chapterId } = useLocalSearchParams<{
    handoutId: string;
    chapterId: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  // হ্যান্ডআউটের আসল _id বের করার জন্য প্রথমে slug দিয়ে fetch
  const { data: handoutData, isLoading: handoutLoading } =
    useGetHandoutBySlugQuery(slug ?? "", { skip: !slug });

  const realHandoutId = handoutData?.data?._id;

  const {
    data: chaptersData,
    isLoading: chaptersLoading,
    isError,
  } = useGetChaptersByHandoutQuery(realHandoutId ?? "", {
    skip: !realHandoutId,
  });

  const chapters = chaptersData?.data ?? [];
  const currentIndex = chapters.findIndex((c) => c._id === chapterId);
  const currentChapter = chapters[currentIndex];
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < chapters.length - 1
      ? chapters[currentIndex + 1]
      : null;

  const paragraphs = useMemo(
    () => (currentChapter?.content ?? "").split(/\n+/).filter(Boolean),
    [currentChapter?.content],
  );

  const isLoading = handoutLoading || chaptersLoading;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#00914d" />
      </SafeAreaView>
    );
  }

  if (isError || !currentChapter) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 px-6 bg-background dark:bg-dark-background">
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={isDark ? "#f87171" : "#ef4444"}
        />
        <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
          অধ্যায়টি পাওয়া যায়নি
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* টপ বার */}
      <View className="flex-row items-center justify-between gap-2 px-4 py-3">
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

        <View className="flex-1 flex-col items-start justify-start">
          <Text
            numberOfLines={1}
            className="flex-1 text-center text-sm font-semibold text-text dark:text-dark-text line-clamp-1"
          >
            {handoutData?.data?.title}
          </Text>
          <Text className="text-xs font-medium text-text-tertiary dark:text-dark-text-tertiary">
            অধ্যায় {currentIndex + 1} / {chapters.length}
          </Text>
        </View>

        {/* ফন্ট সাইজ কন্ট্রোল */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            disabled={fontSizeIndex === 0}
            onPress={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
            className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
          >
            <Text className="text-text dark:text-dark-text text-xs font-bold">
              A-
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={fontSizeIndex === FONT_SIZES.length - 1}
            onPress={() =>
              setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))
            }
            className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
          >
            <Text className="text-text dark:text-dark-text text-sm font-bold">
              A+
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* progress */}
      <View className=" ">
        <View className="h-0.5  bg-background-tertiary dark:bg-dark-background-tertiary">
          <View
            className="h-0.5  bg-accent"
            style={{
              width: `${((currentIndex + 1) / chapters.length) * 100}%`,
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          paddingTop: 6,
        }}
      >
        <Text className="text-xl font-bold text-text dark:text-dark-text mb-2 mt-1 leading-8">
          {currentChapter.title}
        </Text>

        {paragraphs.map((para, idx) => (
          <Text
            key={idx}
            style={{
              fontSize: FONT_SIZES[fontSizeIndex],
              lineHeight: FONT_SIZES[fontSizeIndex] * 1.7,
            }}
            className="text-text dark:text-dark-text mb-4"
          >
            {para}
          </Text>
        ))}

        {/* prev / next */}
        <View className="flex-row items-center justify-between mt-6 gap-3">
          <TouchableOpacity
            disabled={!prevChapter}
            onPress={() =>
              prevChapter &&
              router.replace(`/handouts/${slug}/chapter/${prevChapter._id}`)
            }
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-border dark:border-dark-border ${
              !prevChapter ? "opacity-40" : ""
            }`}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={isDark ? "#f1f1f1" : "#1b1b1b"}
            />
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              পূর্ববর্তী
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!nextChapter}
            onPress={() =>
              nextChapter &&
              router.replace(`/handouts/${slug}/chapter/${nextChapter._id}`)
            }
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-accent ${
              !nextChapter ? "opacity-40" : ""
            }`}
          >
            <Text className="text-sm font-semibold text-white">পরবর্তী</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
