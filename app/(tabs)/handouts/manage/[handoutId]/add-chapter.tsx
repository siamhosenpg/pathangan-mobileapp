import {
  useAddChapterMutation,
  useGetChaptersByHandoutQuery,
  useUpdateChapterMutation,
} from "@/redux/api/handout/chapterApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
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
  const { handoutId, chapterId } = useLocalSearchParams<{
    handoutId: string;
    chapterId?: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isEditing = Boolean(chapterId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: chaptersData } = useGetChaptersByHandoutQuery(handoutId ?? "", {
    skip: !isEditing || !handoutId,
  });

  const [addChapter, { isLoading: isAdding }] = useAddChapterMutation();
  const [updateChapter, { isLoading: isUpdating }] = useUpdateChapterMutation();

  useEffect(() => {
    if (isEditing && chaptersData) {
      const existing = chaptersData.data.find((c) => c._id === chapterId);
      if (existing) {
        setTitle(existing.title);
        setContent(existing.content);
      }
    }
  }, [isEditing, chaptersData, chapterId]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("তথ্য অসম্পূর্ণ", "অধ্যায়ের টাইটেল ও কনটেন্ট দিন");
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
      router.back();
    } catch {
      Alert.alert("সমস্যা হয়েছে", "অধ্যায় সেভ করা যায়নি");
    }
  };

  const isSaving = isAdding || isUpdating;

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
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          {isEditing ? "অধ্যায় সম্পাদনা" : "নতুন অধ্যায়"}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        >
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              অধ্যায়ের টাইটেল
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="যেমনঃ প্রথম অধ্যায় - সূচনা"
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              className="px-4 py-3 rounded-xl bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text border border-border dark:border-dark-border"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              অধ্যায়ের বিষয়বস্তু
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="এখানে আপনার লেখা শুরু করুন..."
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              multiline
              textAlignVertical="top"
              className="px-4 py-3 rounded-xl bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text border border-border dark:border-dark-border min-h-[300px]"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="px-5 pb-5 pt-2 border-t border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSaving}
          className="bg-accent rounded-xl py-4 items-center justify-center flex-row gap-2"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base">
                {isEditing ? "আপডেট করুন" : "অধ্যায় যোগ করুন"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
