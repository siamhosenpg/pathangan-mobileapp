import {
  useAddChapterMutation,
  useGetChaptersByHandoutQuery,
  useUpdateChapterMutation,
} from "@/redux/api/handout/chapterApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddEditChapterScreen() {
  const { t } = useTranslation();
  const { handoutId, chapterId } = useLocalSearchParams<{
    handoutId: string;
    chapterId?: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isEditing = Boolean(chapterId);
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Edit mode e server theke asha original value. Change hoyeche kina bujhte lage.
  const [original, setOriginal] = useState({ title: "", content: "" });

  // Save successful hole confirm popup skip korar jonno
  const allowLeaveRef = useRef(false);

  const { data: chaptersData } = useGetChaptersByHandoutQuery(handoutId ?? "", {
    skip: !isEditing || !handoutId,
  });

  const [addChapter, { isLoading: isAdding }] = useAddChapterMutation();
  const [updateChapter, { isLoading: isUpdating }] = useUpdateChapterMutation();

  // Edit mode: existing chapter ekbar load kore form e boshai.
  // Ekbar boshale ar overwrite kori na, na hole refetch hole user er lekha muche jabe.
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isEditing || !chaptersData || hasLoadedRef.current) return;

    const existing = chaptersData.data.find((c) => c._id === chapterId);
    if (existing) {
      hasLoadedRef.current = true;
      setTitle(existing.title);
      setContent(existing.content);
      setOriginal({ title: existing.title, content: existing.content });
    }
  }, [isEditing, chaptersData, chapterId]);

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content],
  );

  const hasUnsavedChanges = isEditing
    ? title.trim() !== original.title.trim() ||
      content.trim() !== original.content.trim()
    : title.trim().length > 0 || content.trim().length > 0;

  /* ─────────── Back confirmation ─────────── */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current || !hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        t("handoutData.discardTitle"),
        t("handoutData.discardChapterMessage"),
        [
          { text: t("handoutData.stay"), style: "cancel" },
          {
            text: t("handoutData.discard"),
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, t]);

  const isSaving = isAdding || isUpdating;
  const placeholderColor = isDark ? "#8a8a8a" : "#6d6d6d";

  const handleSubmit = async () => {
    if (isSaving) return;

    if (!title.trim() || !content.trim()) {
      Alert.alert(
        t("handoutData.incompleteTitle"),
        t("handoutData.chapterIncompleteMessage"),
      );
      return;
    }

    try {
      if (isEditing && chapterId) {
        await updateChapter({
          id: chapterId,
          handoutId: handoutId!,
          title: title.trim(),
          content: content.trim(),
        }).unwrap();
      } else {
        await addChapter({
          handoutId: handoutId!,
          title: title.trim(),
          content: content.trim(),
        }).unwrap();
      }

      // popup na dekhiye back jete dao
      allowLeaveRef.current = true;
      router.back();
    } catch {
      Alert.alert(
        t("handoutData.errorTitle"),
        t("handoutData.chapterSaveFailed"),
      );
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* টপ বার */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          {isEditing
            ? t("handoutData.editChapter")
            : t("handoutData.newChapter")}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
        >
          {/* টাইটেল */}
          <View className="border-b border-border dark:border-dark-border">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t("handoutData.chapterTitlePlaceholder")}
              placeholderTextColor={placeholderColor}
              className=" font-bold text-text dark:text-dark-text py-3"
            />
          </View>

          {/* বিষয়বস্তু */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={t("handoutData.chapterContentPlaceholder")}
            placeholderTextColor={placeholderColor}
            multiline
            textAlignVertical="top"
            className="text-base text-text dark:text-dark-text leading-7 min-h-[320px]"
          />
        </ScrollView>

        {/* ফুটার: শব্দ গণনা + সাবমিট */}
        <View className="px-5 pb-3 pt-2 border-t border-border dark:border-dark-border gap-2">
          <Text className="text-xs text-center text-text-tertiary dark:text-dark-text-tertiary">
            {t("handoutData.words", { value: wordCount })}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSaving}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-4 items-center justify-center flex-row gap-2"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text className="text-white font-bold text-base">
                  {isEditing
                    ? t("handoutData.updateChapter")
                    : t("handoutData.addChapterBtn")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
