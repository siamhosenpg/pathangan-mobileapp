import { useSendPrivateQuestionMutation } from "@/redux/api/privateQuestion/privateQuestionApi";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AskQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  visible,
  onClose,
  receiverId,
  receiverName,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [questionText, setQuestionText] = useState("");
  const [sendQuestion, { isLoading }] = useSendPrivateQuestionMutation();

  const handleClose = () => {
    setQuestionText("");
    onClose();
  };

  const handleSend = async () => {
    if (!questionText.trim() || isLoading) return;
    try {
      await sendQuestion({
        receiverId,
        questionText: questionText.trim(),
      }).unwrap();
      handleClose();
    } catch (err) {
      console.error("প্রশ্ন পাঠাতে সমস্যা হয়েছে:", err);
    }
  };

  const charCount = questionText.length;
  const maxChar = 500;
  const isOverLimit = charCount > maxChar;
  const canSend = questionText.trim().length > 0 && !isOverLimit && !isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-background dark:bg-dark-background-secondary rounded-t-3xl px-5 pt-5 pb-8">
              {/* Handle bar */}
              <View className="w-10 h-1 rounded-full bg-background-tertiary dark:bg-dark-background-tertiary self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-1">
                  <Text className="text-base font-bold text-text dark:text-dark-text">
                    প্রশ্ন করুন
                  </Text>
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                    {receiverName}-কে একটি প্রশ্ন পাঠান
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-background-secondary dark:bg-dark-background-tertiary items-center justify-center"
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={isDark ? "#8a8a8a" : "#6d6d6d"}
                  />
                </TouchableOpacity>
              </View>

              {/* Input */}
              <View className="rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background p-4 mb-3">
                <TextInput
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder={`${receiverName}-কে কিছু জিজ্ঞেস করুন...`}
                  placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
                  multiline
                  maxLength={520}
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-sm text-text dark:text-dark-text leading-relaxed min-h-[100px]"
                  style={{ fontFamily: undefined }}
                  autoFocus
                />
              </View>

              {/* Char count */}
              <View className="flex-row justify-end mb-4">
                <Text
                  className={`text-xs ${
                    isOverLimit
                      ? "text-red-500"
                      : "text-text-tertiary dark:text-dark-text-tertiary"
                  }`}
                >
                  {charCount}/{maxChar}
                </Text>
              </View>

              {/* Send button */}
              <TouchableOpacity
                onPress={handleSend}
                disabled={!canSend}
                className={`py-3.5 rounded-2xl items-center justify-center flex-row gap-2 ${
                  canSend
                    ? "bg-accent"
                    : "bg-background-tertiary dark:bg-dark-background-tertiary"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="send"
                      size={15}
                      color={canSend ? "#fff" : isDark ? "#8a8a8a" : "#6d6d6d"}
                    />
                    <Text
                      className={`text-sm font-semibold ${
                        canSend
                          ? "text-white"
                          : "text-text-tertiary dark:text-dark-text-tertiary"
                      }`}
                    >
                      প্রশ্ন পাঠান
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

export default AskQuestionModal;
