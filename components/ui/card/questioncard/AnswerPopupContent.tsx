import {
  useCreateAnswerMutation,
  useUpdateAnswerMutation,
} from "@/redux/api/answer/answersApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSheetCloseGuard } from "../../bottom-sheet/BottomSheetProvider";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";

interface Props {
  questionId: string;
  questionText: string;
  // edit mode এর জন্য: answerId দিলেই edit mode চালু হবে
  answerId?: string;
  initialText?: string;
}

const AnswerPopupContent = ({
  questionId,
  questionText,
  answerId,
  initialText = "",
}: Props) => {
  const { close } = useBottomSheet();
  const { t } = useTranslation();

  const isEdit = !!answerId;

  const [answer, setAnswer] = useState(initialText);
  const [error, setError] = useState("");

  const [createAnswer, { isLoading: isCreating }] = useCreateAnswerMutation();
  const [updateAnswer, { isLoading: isUpdating }] = useUpdateAnswerMutation();
  const isLoading = isCreating || isUpdating;

  // edit mode এ আসল text থেকে বদলেছে কিনা
  const hasChanges = answer.trim() !== initialText.trim();
  const isDirty = isEdit ? hasChanges : answer.trim().length > 0;

  const isSubmitDisabled =
    !answer.trim() || isLoading || (isEdit && !hasChanges);

  // কিছু লেখা/বদলানো থাকলে backdrop ট্যাপ, নিচে drag আর Android back button
  // দিয়ে বন্ধ করতে গেলেও confirm alert আসবে (provider এটা সামলায়)
  useSheetCloseGuard({
    when: isDirty && !isLoading,
    title: t("answerData.areYouSure"),
    message: t("answerData.discardAnswer"),
    confirmText: t("answerData.goBack"),
    cancelText: t("answerData.cancel"),
  });

  // শুধু উপরের X বাটনের জন্য: close() সরাসরি guard এড়িয়ে যায়,
  // তাই এখানে নিজেই confirm দেখাই
  const handleClose = () => {
    if (isDirty) {
      Alert.alert(
        t("answerData.areYouSure"),
        t("answerData.discardAnswer"),
        [
          { text: t("answerData.cancel"), style: "cancel" },
          {
            text: t("answerData.goBack"),
            style: "destructive",
            onPress: () => close(),
          },
        ],
        { cancelable: true },
      );
      return;
    }
    close();
  };

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    if (trimmed.length < 5) {
      setError(t("answerData.answerMinLength"));
      return;
    }
    setError("");

    try {
      if (isEdit && answerId) {
        await updateAnswer({ answerId, questionId, text: trimmed }).unwrap();
      } else {
        await createAnswer({ questionId, text: trimmed }).unwrap();
        setAnswer("");
      }
      // সফল submit এর পর close() চালালে guard কাজ করে না, তাই alert আসবে না
      close();
    } catch (err: any) {
      // server message ইংরেজিতে আসে, তাই status দিয়ে check করা হলো
      if (err?.status === 409) {
        setError(t("answerData.alreadyAnswered"));
      } else {
        setError(err?.data?.message || t("answerData.somethingWentWrong"));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-2 pb-1">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {isEdit
                ? t("answerData.editAnswer")
                : t("answerData.writeAnswer")}
            </Text>
          </View>

          {/* Question preview */}
          <View className="px-1 py-3 mb-3 border-b border-border dark:border-dark-border">
            <Text className=" font-medium text-text dark:text-dark-text leading-snug">
              {questionText}
            </Text>
          </View>

          {/* TextInput */}
          <TextInput
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              if (error) setError("");
            }}
            placeholder={t("answerData.answerPlaceholder")}
            placeholderTextColor="#9CA3AF"
            multiline
            scrollEnabled
            autoFocus={isEdit}
            textAlignVertical="top"
            maxLength={10000}
            className=" text-text dark:text-dark-text  py-2"
            style={{
              minHeight: 120,
              maxHeight: 230,
              borderColor: "transparent",
              borderWidth: 1,
            }}
          />

          {error ? (
            <Text className="text-xs font-medium text-red-500 mt-1">
              {error}
            </Text>
          ) : null}

          {/* Footer */}
          <View className="flex-row items-center justify-between py-4">
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              {answer.length} {t("answerData.characters")}
            </Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-row items-center gap-2 px-5 py-2.5 rounded-full bg-accent"
              style={{ opacity: isSubmitDisabled ? 0.4 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={isEdit ? "checkmark-outline" : "send-outline"}
                  size={15}
                  color="#fff"
                />
              )}
              <Text className="text-white  font-semibold">
                {isLoading
                  ? isEdit
                    ? t("answerData.updating")
                    : t("answerData.posting")
                  : isEdit
                    ? t("answerData.updateAnswer")
                    : t("answerData.submitAnswer")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AnswerPopupContent;
