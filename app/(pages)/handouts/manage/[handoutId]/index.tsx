import {
  useDeleteChapterMutation,
  useGetChaptersByHandoutQuery,
} from "@/redux/api/handout/chapterApi";
import { usePublishHandoutMutation } from "@/redux/api/handout/handoutApi";
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
  const { t } = useTranslation();
  const { handoutId } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: chaptersData, isLoading } = useGetChaptersByHandoutQuery(
    handoutId ?? "",
    { skip: !handoutId },
  );

  const [deleteChapter] = useDeleteChapterMutation();
  const [publishHandout, { isLoading: isPublishing }] =
    usePublishHandoutMutation();

  const chapters = chaptersData?.data ?? [];

  const handleDeleteChapter = (chapterId: string) => {
    Alert.alert(
      t("handoutData.deleteChapterTitle"),
      t("handoutData.deleteMessage"),
      [
        { text: t("handoutData.cancel"), style: "cancel" },
        {
          text: t("handoutData.deleteAction"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChapter({
                id: chapterId,
                handoutId: handoutId!,
              }).unwrap();
            } catch {
              Alert.alert(
                t("handoutData.errorTitle"),
                t("handoutData.deleteChapterFailed"),
              );
            }
          },
        },
      ],
    );
  };

  const handlePublish = async () => {
    if (chapters.length === 0) {
      Alert.alert(
        t("handoutData.noChaptersTitle"),
        t("handoutData.noChaptersMessage"),
      );
      return;
    }
    try {
      await publishHandout(handoutId!).unwrap();
      Alert.alert(t("handoutData.success"), t("handoutData.publishSuccess"), [
        {
          text: t("handoutData.ok"),
          onPress: () => router.replace("/handouts"),
        },
      ]);
    } catch {
      Alert.alert(t("handoutData.errorTitle"), t("handoutData.publishFailed"));
    }
  };

  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="arrow-back" size={20} color={iconColor} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text">
          {t("handoutData.manageChapters")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/handouts/manage/${handoutId}/edit`)}
          accessibilityRole="button"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="create-outline" size={18} color={iconColor} />
        </TouchableOpacity>
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
          {/* সারসংক্ষেপ */}
          <View className="flex-row items-center gap-2 px-1">
            <Ionicons name="reader-outline" size={16} color="#00914d" />
            <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
              {t("handoutData.chapters", { value: chapters.length })}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(`/handouts/manage/${handoutId}/add-chapter`)
            }
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-accent bg-accent/5"
          >
            <Ionicons name="add-circle-outline" size={20} color="#00914d" />
            <Text className="text-accent font-semibold text-sm">
              {t("handoutData.addNewChapter")}
            </Text>
          </TouchableOpacity>

          {chapters.length === 0 && (
            <View className="items-center py-10 gap-3">
              <View className="w-16 h-16 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary">
                <Ionicons
                  name="document-outline"
                  size={28}
                  color={isDark ? "#4b5563" : "#9ca3af"}
                />
              </View>
              <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
                {t("handoutData.noChapters")}
              </Text>
            </View>
          )}

          {chapters.map((chapter, index) => (
            <View
              key={chapter._id}
              className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3 border border-border dark:border-dark-border"
            >
              <View className="w-9 h-9 rounded-full bg-accent-transparent items-center justify-center">
                <Text className="text-accent text-sm font-bold">
                  {index + 1}
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
                  {t("handoutData.words", { value: chapter.wordCount })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteChapter(chapter._id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t("handoutData.delete")}
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
          activeOpacity={0.85}
          className="bg-accent rounded-2xl py-4 items-center justify-center flex-row gap-2"
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
                {t("handoutData.publishAction")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
