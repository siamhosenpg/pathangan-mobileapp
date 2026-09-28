import { useSendPrivateQuestionMutation } from "@/redux/api/privateQuestion/privateQuestionApi";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [questionText, setQuestionText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [sendQuestion, { isLoading }] = useSendPrivateQuestionMutation();

  const inputRef = useRef<TextInput>(null);
  // খোলার ঠিক পরপর backdrop এর ভুল touch আটকানোর জন্য
  const ignoreBackdropRef = useRef(false);

  const charCount = questionText.length;
  const maxChar = 500;
  const isOverLimit = charCount > maxChar;
  const hasText = questionText.trim().length > 0;
  const canSend = hasText && !isOverLimit && !isLoading;

  // modal খুললে ৪০০ms backdrop চাপ উপেক্ষা
  useEffect(() => {
    if (!visible) return;
    ignoreBackdropRef.current = true;
    const timer = setTimeout(() => {
      ignoreBackdropRef.current = false;
    }, 400);
    return () => clearTimeout(timer);
  }, [visible]);

  // Android এ কীবোর্ডের উচ্চতা নিজে মাপা (height behavior এর ঝলকানি এড়াতে)
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // modal সম্পূর্ণ দেখা যাওয়ার পর focus (autoFocus এর বদলে)
  const handleShow = () => {
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // লেখা মুছে modal বন্ধ (confirm ছাড়াই)
  const resetAndClose = () => {
    setQuestionText("");
    Keyboard.dismiss();
    onClose();
  };

  // back / ✕ বাটন চাপলে এটা চলবে
  const handleRequestClose = () => {
    // পাঠানোর সময় বন্ধ করা যাবে না
    if (isLoading) return;

    // কিছু না লিখলে সরাসরি বন্ধ
    if (!hasText) {
      resetAndClose();
      return;
    }

    // লেখা থাকলে confirmation
    Alert.alert(
      t("askQuestionModal.discardTitle"),
      t("askQuestionModal.discardMessage"),
      [
        {
          text: t("askQuestionModal.keepEditing"),
          style: "cancel",
        },
        {
          text: t("askQuestionModal.discard"),
          style: "destructive",
          onPress: resetAndClose,
        },
      ],
    );
  };

  // backdrop চাপলে (খোলার প্রথম ৪০০ms বাদে)
  const handleBackdropPress = () => {
    if (ignoreBackdropRef.current) return;
    handleRequestClose();
  };

  const handleSend = async () => {
    if (!canSend) return;
    try {
      await sendQuestion({
        receiverId,
        questionText: questionText.trim(),
      }).unwrap();
      // সফলভাবে পাঠানো হয়েছে, তাই confirm লাগবে না
      resetAndClose();
    } catch {}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
      onShow={handleShow}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBackdropPress}
        className="flex-1 bg-black/50 justify-end"
      >
        <KeyboardAvoidingView
          // Android এ নিজে padding দিচ্ছি, তাই এখানে behavior নেই
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          enabled={Platform.OS === "ios"}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              className="bg-background dark:bg-dark-background-secondary rounded-t-3xl px-5 pt-5 pb-8"
              style={
                Platform.OS === "android"
                  ? { marginBottom: keyboardHeight }
                  : undefined
              }
            >
              {/* Handle bar */}
              <View className="w-10 h-1 rounded-full bg-background-tertiary dark:bg-dark-background-tertiary self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-1">
                  <Text className="text-base font-bold text-text dark:text-dark-text">
                    {t("askQuestion")}
                  </Text>
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                    {t("askQuestionModal.subtitle", {
                      name: receiverName,
                      interpolation: { escapeValue: false },
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleRequestClose}
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
                  ref={inputRef}
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder={t("askQuestionModal.placeholder", {
                    name: receiverName,
                    interpolation: { escapeValue: false },
                  })}
                  placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
                  multiline
                  maxLength={520}
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-sm text-text dark:text-dark-text leading-relaxed min-h-[100px]"
                  style={{ fontFamily: undefined }}
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
                      {t("askQuestionModal.send")}
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
