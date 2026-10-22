import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import PrivateContentMenuSheet from "@/components/ui/bottom-sheet/PrivateContentMenuSheet";
import { getDateLocale } from "@/components/ui/card/questioncard/PrivateQuestionPersonCard";

import {
  useCreatePrivateAnswerMutation,
  useDeletePrivateAnswerMutation,
  useGetPrivateAnswerByQuestionQuery,
} from "@/redux/api/answer/privateAnswerApi";
import {
  privateQuestionApi,
  useDeletePrivateQuestionMutation,
  useGetPrivateQuestionByIdQuery,
} from "@/redux/api/privateQuestion/privateQuestionApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useDispatch } from "react-redux";

const MIN_ANSWER = 15;
const MAX_ANSWER = 2000;

// ── null-safe user helper ──
const resolveUser = (raw: any, deletedName: string) => {
  const user = raw && typeof raw === "object" ? raw : null;
  return {
    isDeleted: !user,
    name: user?.name || user?.username || deletedName,
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
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { open } = useBottomSheet();
  const dispatch = useDispatch();

  const [answerText, setAnswerText] = useState("");

  // ── Queries ──
  const { data: qData, isLoading: qLoading } = useGetPrivateQuestionByIdQuery(
    id,
    { skip: !id },
  );
  const question = qData?.question;

  const { data: aData, isLoading: aLoading } =
    useGetPrivateAnswerByQuestionQuery(id, { skip: !id });
  const existingAnswer = aData?.answer ?? null;

  // ── Mutations ──
  const [createAnswer, { isLoading: submitting }] =
    useCreatePrivateAnswerMutation();
  const [deleteQuestion] = useDeletePrivateQuestionMutation();
  const [deleteAnswer] = useDeletePrivateAnswerMutation();

  // ── Unread fix ──
  // receiver প্রশ্নটা খুললে backend isRead true করে। কিন্তু list / thread /
  // unread count এর cache পুরোনো থেকে যায়, তাই একবার invalidate করছি।
  // ref দিয়ে আটকানো আছে, তাই কোনো লুপ হবে না।
  const markedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!question || !id) return;
    if (markedIdRef.current === id) return;
    if (question.isReceiver && question.isRead === false) {
      markedIdRef.current = id;
      dispatch(privateQuestionApi.util.invalidateTags(["PrivateQuestion"]));
    }
  }, [question, id, dispatch]);

  const deletedName = t("privateData.deletedUser");
  const sender = resolveUser(question?.senderId, deletedName);
  const receiver = resolveUser(question?.receiverId, deletedName);

  // backend নিজেই বলে দেয় আমি sender নাকি receiver
  const isSender = !!question?.isSender;
  const isReceiver = !!question?.isReceiver;

  // ── Answer validation ──
  const charCount = answerText.length;
  const trimmedLength = answerText.trim().length;
  const remaining = MIN_ANSWER - trimmedLength;
  const canSubmit =
    trimmedLength >= MIN_ANSWER && charCount <= MAX_ANSWER && !submitting;

  // ── Submit answer ──
  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createAnswer({
        questionId: id,
        text: answerText.trim(),
      }).unwrap();
      setAnswerText("");
    } catch (err) {
      Alert.alert(t("privateData.error"), getErrorMessage(err));
    }
  };

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
          {t("privateData.questionNotFound")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-accent font-semibold">
            {t("privateData.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // উত্তর লেখার ইনপুট দেখানো হবে কিনা
  const showInput =
    isReceiver && !aLoading && !existingAnswer && question.status !== "ignored";

  // ── Delete (confirm popup সহ) ──
  const confirmDeleteQuestion = () => {
    Alert.alert(
      t("privateData.deleteQuestionTitle"),
      t("privateData.deleteQuestionMessage"),
      [
        { text: t("privateData.no"), style: "cancel" },
        {
          text: t("privateData.yesDelete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuestion(question._id).unwrap();
              router.back();
            } catch (err) {
              Alert.alert(t("privateData.error"), getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const confirmDeleteAnswer = () => {
    if (!existingAnswer) return;
    Alert.alert(
      t("privateData.deleteAnswerTitle"),
      t("privateData.deleteAnswerMessage"),
      [
        { text: t("privateData.no"), style: "cancel" },
        {
          text: t("privateData.yesDelete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnswer(existingAnswer._id).unwrap();
            } catch (err) {
              Alert.alert(t("privateData.error"), getErrorMessage(err));
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
          {t("privateData.questionDetails")}
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
              ? t("privateData.statusAnswered")
              : question.status === "ignored"
                ? t("privateData.statusIgnored")
                : t("privateData.statusPending")}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: showInput ? 24 : insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Question card ── */}
        <View className="p-5 border-b border-border dark:border-dark-border">
          <View className="flex-row items-center gap-2 mb-3">
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
                  {new Date(question.createdAt).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                {question.isEdited && (
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    · {t("privateData.edited")}
                  </Text>
                )}
              </View>
            </View>
            <MenuButton onPress={openQuestionMenu} isDark={isDark} />
          </View>

          <Text className="text-base text-text font-medium dark:text-dark-text leading-relaxed">
            {question.questionText}
          </Text>
        </View>

        {/* ── Answer input (প্রশ্নের কার্ডের ঠিক নিচে) ── */}
        {showInput && (
          <View className="px-5 pt-4">
            <TextInput
              value={answerText}
              onChangeText={setAnswerText}
              placeholder={t("privateData.answerPlaceholder")}
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              multiline
              maxLength={MAX_ANSWER + 100}
              textAlignVertical="top"
              className="text-base text-text dark:text-dark-text leading-relaxed min-h-[160px]"
            />
          </View>
        )}

        {/* ── Existing answer ── */}
        {aLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="small" color="#00914d" />
          </View>
        ) : existingAnswer ? (
          <View className="mx-5 mt-5">
            <Text className="text-xs font-semibold text-text-tertiary dark:text-dark-text-tertiary uppercase mb-2 px-1">
              {t("privateData.answer")}
            </Text>
            <View>
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
                      dateLocale,
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                    {existingAnswer.isEdited
                      ? ` · ${t("privateData.edited")}`
                      : ""}
                  </Text>
                </View>
                <MenuButton onPress={openAnswerMenu} isDark={isDark} />
              </View>

              <Text className="text-base text-text dark:text-dark-text leading-relaxed">
                {existingAnswer.text}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Fixed bottom bar: character count + submit button ── */}
      {showInput && (
        <View
          className="px-4 pt-3 border-t border-border dark:border-dark-border bg-background dark:bg-dark-background flex-row items-center justify-between"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View>
            <Text
              className={`text-xs ${
                charCount > MAX_ANSWER
                  ? "text-red-500"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {charCount}/{MAX_ANSWER}
            </Text>
            {trimmedLength > 0 && remaining > 0 && (
              <Text className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                {t("privateData.minCharsHint", {
                  num: remaining,
                  min: MIN_ANSWER,
                })}
              </Text>
            )}
          </View>

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
                  {t("privateData.submitAnswer")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default PrivateQuestionDetailPage;
