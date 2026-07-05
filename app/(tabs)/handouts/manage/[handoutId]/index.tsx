import {
  useDeleteChapterMutation,
  useGetChaptersByHandoutQuery,
} from "@/redux/api/handout/chapterApi";
import { usePublishHandoutMutation } from "@/redux/api/handout/handoutApi";
import { toBanglaNumber } from "@/utils/toBanglaNumber";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageHandoutScreen() {
  const { handoutId } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const n = (num: number) => (isBn ? toBanglaNumber(num) : String(num));

  const {
    data: chaptersData,
    isLoading,
    refetch,
  } = useGetChaptersByHandoutQuery(handoutId ?? "", { skip: !handoutId });

  const [deleteChapter] = useDeleteChapterMutation();
  const [publishHandout, { isLoading: isPublishing }] =
    usePublishHandoutMutation();

  const chapters = chaptersData?.data ?? [];

  const handleDeleteChapter = (chapterId: string) => {
    Alert.alert("অধ্যায় ডিলিট করবেন?", "এটি পরে পুনরুদ্ধার করা যাবে", [
      { text: "বাতিল", style: "cancel" },
      {
        text: "ডিলিট করুন",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteChapter({
              id: chapterId,
              handoutId: handoutId!,
            }).unwrap();
          } catch {
            Alert.alert("সমস্যা হয়েছে", "অধ্যায় ডিলিট করা যায়নি");
          }
        },
      },
    ]);
  };

  const handlePublish = async () => {
    if (chapters.length === 0) {
      Alert.alert("অধ্যায় নেই", "পাবলিশ করার আগে অন্তত একটি অধ্যায় যোগ করুন");
      return;
    }
    try {
      await publishHandout(handoutId!).unwrap();
      Alert.alert("সফল!", "হ্যান্ডআউট পাবলিশ হয়েছে", [
        { text: "ঠিক আছে", onPress: () => router.replace("/handouts") },
      ]);
    } catch {
      Alert.alert("সমস্যা হয়েছে", "পাবলিশ করা যায়নি");
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
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
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          অধ্যায় পরিচালনা
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00914d" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
        >
          <TouchableOpacity
            onPress={() =>
              router.push(`/handouts/manage/${handoutId}/add-chapter`)
            }
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-accent"
          >
            <Ionicons name="add-circle-outline" size={20} color="#00914d" />
            <Text className="text-accent font-semibold text-sm">
              নতুন অধ্যায় যোগ করুন
            </Text>
          </TouchableOpacity>

          {chapters.length === 0 && (
            <View className="items-center py-10 gap-2">
              <Ionicons
                name="document-outline"
                size={40}
                color={isDark ? "#4b5563" : "#9ca3af"}
              />
              <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
                এখনো কোনো অধ্যায় যোগ করা হয়নি
              </Text>
            </View>
          )}

          {chapters.map((chapter, index) => (
            <View
              key={chapter._id}
              className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-xl px-4 py-3 border border-border dark:border-dark-border"
            >
              <View className="w-8 h-8 rounded-full bg-accent-transparent items-center justify-center">
                <Text className="text-accent text-xs font-bold">
                  {n(index + 1)}
                </Text>
              </View>
              <TouchableOpacity
                className="flex-1"
                onPress={() =>
                  router.push(
                    `/handouts/manage/${handoutId}/add-chapter?chapterId=${chapter._id}`,
                  )
                }
              >
                <Text
                  numberOfLines={1}
                  className="text-sm font-semibold text-text dark:text-dark-text"
                >
                  {chapter.title}
                </Text>
                <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                  {n(chapter.wordCount)} শব্দ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteChapter(chapter._id)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="px-5 pb-5 pt-2 border-t border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={handlePublish}
          disabled={isPublishing}
          className="bg-accent rounded-xl py-4 items-center justify-center flex-row gap-2"
        >
          {isPublishing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
              />
              <Text className="text-white font-bold text-base">
                পাবলিশ করুন
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
