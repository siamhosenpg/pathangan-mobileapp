import { useCreateAnswerMutation } from "@/redux/api/answer/answersApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";

interface Props {
  questionId: string;
  questionText: string;
}

const AnswerPopupContent = ({ questionId, questionText }: Props) => {
  const { close } = useBottomSheet();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [createAnswer, { isLoading }] = useCreateAnswerMutation();

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    if (answer.trim().length < 5) {
      setError("উত্তর কমপক্ষে ৫ অক্ষরের হতে হবে");
      return;
    }
    setError("");
    try {
      await createAnswer({ questionId, text: answer.trim() }).unwrap();
      setAnswer("");
      close();
    } catch (err: any) {
      const msg = err?.data?.message;
      if (msg === "You have already answered this question") {
        setError("আপনি আগেই এই প্রশ্নের উত্তর দিয়েছেন");
      } else {
        setError(msg || "কিছু একটা সমস্যা হয়েছে");
      }
    }
  };

  return (
    // ✅ বাইরে tap করলে keyboard dismiss
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 px-4">
        {/* Question preview */}
        <View className="px-1 py-3 mb-3 border-b border-border dark:border-dark-border">
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-1">
            প্রশ্ন
          </Text>
          <Text className="text-sm font-semibold text-text dark:text-dark-text leading-snug">
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
          placeholder="আপনার উত্তর লিখুন..."
          placeholderTextColor="#9CA3AF"
          multiline
          scrollEnabled
          textAlignVertical="top"
          className="text-sm text-text dark:text-dark-text bg-background-secondary dark:bg-dark-background-secondary rounded-xl px-4 py-3"
          style={{
            minHeight: 120,
            maxHeight: 180,
            borderColor: error ? "#EF4444" : "transparent",
            borderWidth: 1,
          }}
        />

        {error ? (
          <Text className="text-xs text-red-500 mt-1">{error}</Text>
        ) : null}

        {/* Footer */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {answer.length} অক্ষর
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!answer.trim() || isLoading}
            className="flex-row items-center gap-2 px-5 py-2 rounded-full bg-accent"
            style={{ opacity: !answer.trim() || isLoading ? 0.4 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send-outline" size={15} color="#fff" />
            )}
            <Text className="text-white text-sm font-medium">
              {isLoading ? "পোস্ট হচ্ছে..." : "উত্তর দিন"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AnswerPopupContent;
