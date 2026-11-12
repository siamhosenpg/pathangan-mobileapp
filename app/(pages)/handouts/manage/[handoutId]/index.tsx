import {
  useDeleteChapterMutation,
  useGetChaptersByHandoutQuery,
} from "@/redux/api/handout/chapterApi";
import {
  useGetHandoutBySlugQuery,
  usePublishHandoutMutation,
} from "@/redux/api/handout/handoutApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { HANDOUT_STATUS_STYLE } from "@/utils/handout/handoutStatus";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
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

// publish fail হলে সার্ভার যে chapterId পাঠায়, সেটা বের করার জন্য
type PublishErrorShape = {
  data?: { moderation?: { chapterId?: string | null } };
};

export default function ManageHandoutScreen() {
  const { t } = useTranslation();
  const { handoutId } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // publish fail হলে যে chapter-এ খারাপ লেখা পাওয়া গেছে (backend এর hasBadText এর পাশাপাশি)
  const [flaggedChapterId, setFlaggedChapterId] = useState<string | null>(null);

  // handout-এর status জানার জন্য (route এ আসা id দিয়েও backend handout খুঁজে পায়)
  const { data: handoutData, isLoading: handoutLoading } =
    useGetHandoutBySlugQuery(handoutId ?? "", { skip: !handoutId });

  const { data: chaptersData, isLoading: chaptersLoading } =
    useGetChaptersByHandoutQuery(handoutId ?? "", { skip: !handoutId });

  const [deleteChapter] = useDeleteChapterMutation();
  const [publishHandout, { isLoading: isPublishing }] =
    usePublishHandoutMutation();

  const chapters = chaptersData?.data ?? [];
  const status = handoutData?.data?.status;
  const statusStyle = status ? HANDOUT_STATUS_STYLE[status] : null;

  // draft ও auto_hidden এ publish করা যাবে। under_review এ owner পারবে না,
  // আর published এ আবার publish করার কিছু নেই
  const canPublish = status === "draft" || status === "auto_hidden";
  const showNotice = status === "auto_hidden" || status === "under_review";

  const isLoading = handoutLoading || chaptersLoading;

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
              if (flaggedChapterId === chapterId) setFlaggedChapterId(null);
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

  // warning icon চাপলে কারণ জানাই
  const showFlaggedInfo = () => {
    Alert.alert(t("handoutData.badTextTitle"), t("handoutData.flaggedChapter"));
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
      setFlaggedChapterId(null);
      Alert.alert(t("handoutData.success"), t("handoutData.publishSuccess"), [
        {
          text: t("handoutData.ok"),
          onPress: () => router.replace("/handouts"),
        },
      ]);
    } catch (error) {
      // খারাপ লেখা থাকলে কোন chapter-এ, সেটা চিহ্নিত করি
      const badChapterId = (error as PublishErrorShape)?.data?.moderation
        ?.chapterId;
      setFlaggedChapterId(badChapterId ?? null);

      // সার্ভারের আসল বার্তা দেখাই
      Alert.alert(t("handoutData.errorTitle"), getErrorMessage(error));
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
          {/* auto_hidden / under_review হলে কারণ জানাই */}
          {showNotice && statusStyle && (
            <View
              className={`flex-row items-start gap-2.5 p-3.5 rounded-2xl border ${statusStyle.border} ${statusStyle.badge}`}
            >
              <Ionicons
                name={
                  status === "auto_hidden" ? "warning-outline" : "time-outline"
                }
                size={18}
                color={status === "auto_hidden" ? "#ef4444" : "#f97316"}
              />
              <Text
                className={`flex-1 text-xs font-medium leading-5 ${statusStyle.text}`}
              >
                {status === "auto_hidden"
                  ? t("handoutData.autoHiddenNotice")
                  : t("handoutData.underReviewNotice")}
              </Text>
            </View>
          )}

          {/* সারসংক্ষেপ + status badge */}
          <View className="flex-row items-center justify-between px-1">
            <View className="flex-row items-center gap-2">
              <Ionicons name="reader-outline" size={16} color="#00914d" />
              <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
                {t("handoutData.chapters", { value: chapters.length })}
              </Text>
            </View>

            {status && statusStyle && (
              <View
                className={`px-2.5 py-0.5 rounded-full ${statusStyle.badge}`}
              >
                <Text className={`text-[10px] font-bold ${statusStyle.text}`}>
                  {t(`handoutData.status.${status}`)}
                </Text>
              </View>
            )}
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

          {chapters.map((chapter, index) => {
            // backend এর hasBadText অথবা publish fail এ পাওয়া chapterId
            const isFlagged =
              chapter.hasBadText === true || flaggedChapterId === chapter._id;

            return (
              <View
                key={chapter._id}
                className={`flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3 border ${
                  isFlagged
                    ? "border-red-500"
                    : "border-border dark:border-dark-border"
                }`}
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
                  {isFlagged && (
                    <Text className="text-[11px] font-medium text-red-500 mt-1">
                      {t("handoutData.flaggedChapter")}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* খারাপ লেখা থাকলে delete icon এর আগে warning icon */}
                {isFlagged && (
                  <TouchableOpacity
                    onPress={showFlaggedInfo}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t("handoutData.badTextTitle")}
                    className="p-2"
                  >
                    <Ionicons name="warning" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}

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
            );
          })}
        </ScrollView>
      )}

      {/* publish বাটন: শুধু draft ও auto_hidden এ */}
      {canPublish && (
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
      )}
    </SafeAreaView>
  );
}
