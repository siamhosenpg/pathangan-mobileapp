import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import {
  ReportReason,
  ReportTargetType,
  useCreateReportMutation,
} from "@/redux/api/others/reportApi";

import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  targetType: ReportTargetType;
  targetId: string;
}

interface ReasonOption {
  value: ReportReason;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const REASONS: ReasonOption[] = [
  { value: "spam", label: "স্প্যাম", icon: "megaphone-outline" },
  {
    value: "harassment",
    label: "হয়রানি বা উত্যক্ত করা",
    icon: "hand-left-outline",
  },
  { value: "hate_speech", label: "ঘৃণামূলক বক্তব্য", icon: "warning-outline" },
  { value: "violence", label: "সহিংসতার হুমকি", icon: "alert-circle-outline" },
  {
    value: "self_harm",
    label: "আত্মক্ষতি / আত্মহত্যা সংক্রান্ত",
    icon: "medkit-outline",
  },
  {
    value: "misinformation",
    label: "ভুল বা বিভ্রান্তিকর তথ্য",
    icon: "help-circle-outline",
  },
  {
    value: "impersonation",
    label: "পরিচয় জালিয়াতি",
    icon: "person-remove-outline",
  },
  { value: "copyright", label: "কপিরাইট লঙ্ঘন", icon: "document-lock-outline" },
  {
    value: "inappropriate_content",
    label: "অনুপযুক্ত কনটেন্ট",
    icon: "eye-off-outline",
  },
  {
    value: "other",
    label: "অন্যান্য কারণ",
    icon: "ellipsis-horizontal-circle-outline",
  },
];

const MIN_OTHER_DESCRIPTION_LENGTH = 5;

/**
 * NOTE:
 * Keyboard handling ar safe-area padding ei component e nei.
 * BottomSheet nijei sheet ke keyboard er upore tole, ar max height
 * komiye dey. Tai ekhane shudhu "header / scrollable list / footer" layout.
 *
 * Eta open korte hobe: open(<ReportSheet ... />, { scrollable: false })
 */
const ReportSheet = ({ targetType, targetId }: Props) => {
  const { close } = useBottomSheet();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [createReport, { isLoading }] = useCreateReportMutation();

  const isOtherSelected = selectedReason === "other";
  const trimmedDescription = description.trim();

  const isSubmitDisabled =
    !selectedReason ||
    isLoading ||
    (isOtherSelected &&
      trimmedDescription.length < MIN_OTHER_DESCRIPTION_LENGTH);

  // Keyboard khulle list er sheshe (input er jaigay) scroll kori,
  // jate input keyboard er niche lukiye na thake.
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const sub = Keyboard.addListener(showEvent, () => {
      if (!isOtherSelected) return;
      // BottomSheet er height update hote ektu somoy lage
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 120);
    });

    return () => sub.remove();
  }, [isOtherSelected]);

  const handleSelectReason = (reason: ReportReason) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (reason === "other") {
      setSelectedReason(reason);
      // input mount howar por focus + scroll
      setTimeout(() => {
        inputRef.current?.focus();
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return;
    }

    Keyboard.dismiss();
    setDescription("");
    setSelectedReason(reason);
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    Keyboard.dismiss();

    try {
      await createReport({
        targetType,
        targetId,
        reason: selectedReason as ReportReason,
        description: trimmedDescription || undefined,
      }).unwrap();

      close();
      setTimeout(() => {
        Alert.alert("রিপোর্ট জমা হয়েছে", "আমাদের টিম শীঘ্রই এটি রিভিউ করবে।");
      }, 300);
    } catch (err: any) {
      if (err?.status === 409) {
        Alert.alert(
          "আগেই রিপোর্ট করা হয়েছে",
          "তুমি এই কনটেন্টটি ইতিমধ্যে রিপোর্ট করেছো।",
        );
      } else {
        Alert.alert("সমস্যা হয়েছে", "রিপোর্ট পাঠানো যায়নি, আবার চেষ্টা করো।");
      }
    }
  };

  return (
    // flexShrink: 1 -> BottomSheet er max height er moddhe shrink korte pare
    <View style={{ flexShrink: 1 }}>
      {/* Header — fixed */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="items-center pb-3 px-4">
          <Text className="text-base font-bold text-text dark:text-dark-text">
            কেন রিপোর্ট করছো?
          </Text>
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
            একটি কারণ বেছে নাও
          </Text>
        </View>
      </TouchableWithoutFeedback>

      {/* Middle — ekhanei shudhu scroll hobe */}
      <ScrollView
        ref={scrollRef}
        style={{ flexGrow: 0, flexShrink: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
      >
        <View className="flex flex-col gap-1">
          {REASONS.map((reason) => {
            const isSelected = selectedReason === reason.value;
            return (
              <TouchableOpacity
                key={reason.value}
                onPress={() => handleSelectReason(reason.value)}
                activeOpacity={0.7}
                className={`flex-row items-center gap-3 px-3 py-2.5 rounded-2xl ${
                  isSelected
                    ? "bg-accent/10 dark:bg-accent/15"
                    : "active:bg-background-secondary dark:active:bg-dark-background-secondary"
                }`}
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    isSelected
                      ? "bg-accent/20"
                      : "bg-gray-500/10 dark:bg-gray-400/10"
                  }`}
                >
                  <Ionicons
                    name={reason.icon}
                    size={17}
                    color={
                      isSelected ? "#00914d" : isDark ? "#9CA3AF" : "#6B7280"
                    }
                  />
                </View>

                <Text
                  className={`flex-1 text-sm font-medium ${
                    isSelected ? "text-accent" : "text-text dark:text-dark-text"
                  }`}
                >
                  {reason.label}
                </Text>

                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected
                      ? "border-accent bg-accent"
                      : "border-border dark:border-dark-border"
                  }`}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* "অন্যান্য কারণ" select korle shudhu ei input dekha jabe */}
          {isOtherSelected && (
            <View className="mt-2 mb-1">
              <TextInput
                ref={inputRef}
                value={description}
                onChangeText={setDescription}
                placeholder="বিস্তারিত লিখো, কমপক্ষে ৫ ক্যারেক্টার"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                multiline
                maxLength={500}
                numberOfLines={3}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
                className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-3.5 py-3 text-sm text-text dark:text-dark-text"
                style={{
                  minHeight: 80,
                  maxHeight: 140,
                  textAlignVertical: "top",
                }}
              />
              <Text
                className={`text-xs mt-1.5 ${
                  trimmedDescription.length < MIN_OTHER_DESCRIPTION_LENGTH
                    ? "text-text-tertiary dark:text-dark-text-tertiary"
                    : "text-accent"
                }`}
              >
                {trimmedDescription.length}/{MIN_OTHER_DESCRIPTION_LENGTH} অক্ষর
                সম্পন্ন
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer — fixed, shobsomoy dekha jabe */}
      <View
        style={{ flexShrink: 0 }}
        className="px-4 pt-3 border-t border-border/50 dark:border-dark-border/50"
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.85}
          className={`rounded-2xl py-3.5 items-center justify-center ${
            isSubmitDisabled ? "bg-gray-300 dark:bg-gray-700" : "bg-red-500"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-sm">
              রিপোর্ট জমা দাও
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportSheet;
