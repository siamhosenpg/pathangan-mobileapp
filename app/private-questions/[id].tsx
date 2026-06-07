import {
  useCreatePrivateAnswerMutation,
  useGetPrivateAnswerByQuestionQuery,
} from "@/redux/api/answer/privateAnswerApi";

import { useGetPrivateQuestionByIdQuery } from "@/redux/api/privateQuestion/privateQuestionApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Avatar ──────────────────────────────────────────────
const Avatar = ({
  name,
  profileImage,
  size = "md",
}: {
  name: string;
  profileImage?: string;
  size?: "sm" | "md";
}) => {
  const dim = size === "sm" ? "w-8 h-8" : "w-11 h-11";
  const text = size === "sm" ? "text-xs" : "text-base";
  return (
    <View
      className={`${dim} rounded-full overflow-hidden border border-border dark:border-dark-border`}
    >
      {profileImage ? (
        <Image
          source={{ uri: profileImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-accent/20 items-center justify-center">
          <Text className={`${text} font-bold text-accent uppercase`}>
            {name?.charAt(0)}
          </Text>
        </View>
      )}
    </View>
  );
};

// ── PrivateQuestionDetailPage ────────────────────────────
const PrivateQuestionDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentUser = useAppSelector((state) => state.auth.user);
  const [answerText, setAnswerText] = useState("");

  // ── Queries ──
  const { data: qData, isLoading: qLoading } =
    useGetPrivateQuestionByIdQuery(id);
  const question = qData?.question;

  const isReceiver =
    currentUser?.id === question?.receiverId?._id ||
    (currentUser as any)?._id === question?.receiverId?._id;

  // ── Private answer query — ✅ নতুন API
  const { data: aData, isLoading: aLoading } =
    useGetPrivateAnswerByQuestionQuery(id, { skip: !id });
  const existingAnswer = aData?.answer ?? null; // ✅ .answers[0] না, সরাসরি .answer

  // ── ✅ নতুন mutation, updateStatus আর লাগবে না
  const [createAnswer, { isLoading: submitting }] =
    useCreatePrivateAnswerMutation();

  // ── Submit answer ──
  const handleSubmit = async () => {
    if (!answerText.trim() || submitting) return;
    try {
      await createAnswer({
        questionId: id,
        text: answerText.trim(),
      }).unwrap();
      setAnswerText("");
      // ✅ refetch লাগবে না — invalidatesTags cache update করবে
    } catch (err) {
      console.error("Answer submit error:", err);
    }
  };

  const charCount = answerText.length;
  const maxChar = 2000;
  const canSubmit =
    answerText.trim().length > 0 && charCount <= maxChar && !submitting;

  if (qLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (!question) {
    return (
      <View
        className="flex-1 bg-background dark:bg-dark-background items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-text-tertiary dark:text-dark-text-tertiary">
          প্রশ্নটি পাওয়া যায়নি
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text dark:text-dark-text flex-1">
          প্রশ্নের বিবরণ
        </Text>

        {/* Status badge */}
        <View
          className={`px-3 py-1 rounded-full ${
            question.status === "answered"
              ? "bg-accent/10"
              : question.status === "ignored"
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              question.status === "answered"
                ? "text-accent"
                : question.status === "ignored"
                  ? "text-red-500"
                  : "text-yellow-700 dark:text-yellow-400"
            }`}
          >
            {question.status === "answered"
              ? "উত্তর দেওয়া হয়েছে"
              : question.status === "ignored"
                ? "উপেক্ষা করা হয়েছে"
                : "অপেক্ষমান"}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Question card ── */}
        <View className="mx-4 mt-4 p-4 rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary">
          <View className="flex-row items-center gap-3 mb-3">
            <Avatar
              name={question.senderId.name}
              profileImage={question.senderId.profileImage}
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text dark:text-dark-text">
                {question.senderId.name}
              </Text>
              <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                @{question.senderId.username}
              </Text>
            </View>
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              {new Date(question.createdAt).toLocaleDateString("bn-BD", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <Text className="text-base text-text dark:text-dark-text leading-relaxed">
            {question.questionText}
          </Text>
        </View>

        {/* ── Existing answer ── */}
        {aLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="small" color="#00914d" />
          </View>
        ) : existingAnswer ? (
          <View className="mx-4 mt-4">
            <Text className="text-xs font-semibold text-text-tertiary dark:text-dark-text-tertiary uppercase mb-2 px-1">
              উত্তর
            </Text>
            <View className="p-4 rounded-2xl border border-accent/30 bg-accent/5 dark:bg-accent/10">
              <View className="flex-row items-center gap-3 mb-3">
                <Avatar
                  name={question.receiverId.name}
                  profileImage={question.receiverId.profileImage}
                  size="sm"
                />
                <Text className="text-sm font-semibold text-text dark:text-dark-text">
                  {question.receiverId.name}
                </Text>
              </View>
              <Text className="text-sm text-text dark:text-dark-text leading-relaxed">
                {existingAnswer.text}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Answer input ── */}
      {isReceiver && !existingAnswer && question.status !== "ignored" && (
        <View
          className="px-4 pt-3 pb-4 border-t border-border dark:border-dark-border bg-background dark:bg-dark-background"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary p-3 mb-2">
            <TextInput
              value={answerText}
              onChangeText={setAnswerText}
              placeholder="আপনার উত্তর লিখুন..."
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              multiline
              maxLength={2100}
              textAlignVertical="top"
              className="text-sm text-text dark:text-dark-text leading-relaxed min-h-[80px] max-h-[160px]"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              className={`text-xs ${
                charCount > maxChar
                  ? "text-red-500"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {charCount}/{maxChar}
            </Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full ${
                canSubmit
                  ? "bg-accent"
                  : "bg-background-tertiary dark:bg-dark-background-tertiary"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={14}
                    color={canSubmit ? "#fff" : isDark ? "#8a8a8a" : "#6d6d6d"}
                  />
                  <Text
                    className={`text-sm font-semibold ${
                      canSubmit
                        ? "text-white"
                        : "text-text-tertiary dark:text-dark-text-tertiary"
                    }`}
                  >
                    উত্তর দাও
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default PrivateQuestionDetailPage;
