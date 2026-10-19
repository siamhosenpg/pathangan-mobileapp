import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import PrivateContentMenuSheet from "@/components/ui/bottom-sheet/PrivateContentMenuSheet";

import {
  useCreatePrivateAnswerMutation,
  useDeletePrivateAnswerMutation,
  useGetPrivateAnswerByQuestionQuery,
} from "@/redux/api/answer/privateAnswerApi";
import {
  useDeletePrivateQuestionMutation,
  useGetPrivateQuestionByIdQuery,
} from "@/redux/api/privateQuestion/privateQuestionApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const MIN_ANSWER = 5;
const MAX_ANSWER = 2000;
const DELETED_USER_NAME = "ডিলিট হওয়া ইউজার";

// ── null-safe user helper ──
const resolveUser = (raw: any) => {
  const user = raw && typeof raw === "object" ? raw : null;
  return {
    isDeleted: !user,
    name: user?.name || user?.username || DELETED_USER_NAME,
    username: user?.username || "",
    profileImage: user?.profileImage as string | undefined,
  };
};

// ── Avatar ──
const Avatar = ({
  name,
  profileImage,
  size = "md",
  isDeleted = false,
}: {
  name: string;
  profileImage?: string;
  size?: "sm" | "md";
  isDeleted?: boolean;
}) => {
  const dim = size === "sm" ? "w-8 h-8" : "w-11 h-11";
  const text = size === "sm" ? "text-xs" : "text-base";
  return (
    <View
      className={`${dim} rounded-full overflow-hidden border border-border dark:border-dark-border`}
    >
      {profileImage && !isDeleted ? (
        <Image
          source={{ uri: profileImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-accent/20 items-center justify-center">
          <Text className={`${text} font-bold text-accent uppercase`}>
            {isDeleted ? "?" : name?.charAt(0)}
          </Text>
        </View>
      )}
    </View>
  );
};

// ── 3-dot বাটন ──
const MenuButton = ({
  onPress,
  isDark,
}: {
  onPress: () => void;
  isDark: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    className="w-8 h-8 items-center justify-center"
  >
    <Ionicons
      name="ellipsis-horizontal"
      size={20}
      color={isDark ? "#9CA3AF" : "#6B7280"}
    />
  </TouchableOpacity>
);

const PrivateQuestionDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { open } = useBottomSheet();

  const [answerText, setAnswerText] = useState("");

  // ── Queries ──
  const { data: qData, isLoading: qLoading } =
    useGetPrivateQuestionByIdQuery(id);
  const question = qData?.question;

  const { data: aData, isLoading: aLoading } =
    useGetPrivateAnswerByQuestionQuery(id, { skip: !id });
  const existingAnswer = aData?.answer ?? null;

  // ── Mutations ──
  const [createAnswer, { isLoading: submitting }] =
    useCreatePrivateAnswerMutation();
  const [deleteQuestion] = useDeletePrivateQuestionMutation();
  const [deleteAnswer] = useDeletePrivateAnswerMutation();

  const sender = resolveUser(question?.senderId);
  const receiver = resolveUser(question?.receiverId);

  // backend নিজেই বলে দেয় আমি sender নাকি receiver
  const isSender = !!question?.isSender;
  const isReceiver = !!question?.isReceiver;

  // ── Submit answer ──
  const handleSubmit = async () => {
    if (!answerText.trim() || submitting) return;
    try {
      await createAnswer({
        questionId: id,
        text: answerText.trim(),
      }).unwrap();
      setAnswerText("");
    } catch (err) {
      Alert.alert("ত্রুটি", getErrorMessage(err));
    }
  };

  const charCount = answerText.length;
  const canSubmit =
    answerText.trim().length >= MIN_ANSWER &&
    charCount <= MAX_ANSWER &&
    !submitting;

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
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-accent font-semibold">ফিরে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Delete (confirm popup সহ) ──
  const confirmDeleteQuestion = () => {
    Alert.alert(
      "প্রশ্নটি মুছে ফেলবেন?",
      "আপনি কি সত্যিই এই প্রশ্নটি মুছে ফেলতে চান? এর উত্তর আর সেই উত্তরের রেটিংও মুছে যাবে।",
      [
        { text: "না", style: "cancel" },
        {
          text: "হ্যাঁ, মুছে ফেলুন",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuestion(question._id).unwrap();
              router.back();
            } catch (err) {
              Alert.alert("ত্রুটি", getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const confirmDeleteAnswer = () => {
    if (!existingAnswer) return;
    Alert.alert(
      "উত্তরটি মুছে ফেলবেন?",
      "আপনি কি সত্যিই আপনার উত্তরটি মুছে ফেলতে চান? এর রেটিংও মুছে যাবে।",
      [
        { text: "না", style: "cancel" },
        {
          text: "হ্যাঁ, মুছে ফেলুন",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnswer(existingAnswer._id).unwrap();
            } catch (err) {
              Alert.alert("ত্রুটি", getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  // ── 3-dot মেনু খোলা ──
  const openQuestionMenu = () => {
    open(
      <PrivateContentMenuSheet
        targetType="private_question"
        targetId={question._id}
        isOwner={isSender}
        onEdit={() =>
          router.push(`/private-questions/edit/${question._id}?type=question`)
        }
        onDelete={confirmDeleteQuestion}
      />,
    );
  };

  const openAnswerMenu = () => {
    if (!existingAnswer) return;
    open(
      <PrivateContentMenuSheet
        targetType="answer"
        targetId={existingAnswer._id}
        isOwner={isReceiver}
        onEdit={() =>
          router.push(`/private-questions/edit/${question._id}?type=answer`)
        }
        onDelete={confirmDeleteAnswer}
      />,
    );
  };

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
              name={sender.name}
              profileImage={sender.profileImage}
              isDeleted={sender.isDeleted}
            />
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold ${
                  sender.isDeleted
                    ? "text-text-tertiary dark:text-dark-text-tertiary italic"
                    : "text-text dark:text-dark-text"
                }`}
                numberOfLines={1}
              >
                {sender.name}
              </Text>
              <View className="flex-row items-center gap-1">
                {!sender.isDeleted && !!sender.username && (
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    @{sender.username} ·
                  </Text>
                )}
                <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                  {new Date(question.createdAt).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                {question.isEdited && (
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    · সম্পাদিত
                  </Text>
                )}
              </View>
            </View>
            <MenuButton onPress={openQuestionMenu} isDark={isDark} />
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
                  name={receiver.name}
                  profileImage={receiver.profileImage}
                  size="sm"
                  isDeleted={receiver.isDeleted}
                />
                <View className="flex-1">
                  <Text
                    className={`text-sm font-semibold ${
                      receiver.isDeleted
                        ? "text-text-tertiary dark:text-dark-text-tertiary italic"
                        : "text-text dark:text-dark-text"
                    }`}
                  >
                    {receiver.name}
                  </Text>
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    {new Date(existingAnswer.createdAt).toLocaleDateString(
                      "bn-BD",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                    {existingAnswer.isEdited ? " · সম্পাদিত" : ""}
                  </Text>
                </View>
                <MenuButton onPress={openAnswerMenu} isDark={isDark} />
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
              maxLength={MAX_ANSWER + 100}
              textAlignVertical="top"
              className="text-sm text-text dark:text-dark-text leading-relaxed min-h-[80px] max-h-[160px]"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              className={`text-xs ${
                charCount > MAX_ANSWER
                  ? "text-red-500"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {charCount}/{MAX_ANSWER}
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
