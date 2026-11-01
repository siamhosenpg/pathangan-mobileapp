import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { ModerationNotice as ModerationNoticeType } from "@/types/postTypes";

interface Props {
  notice?: ModerationNoticeType | null;
  // answer-এর ভেতরে বসালে true দিন (পাশের margin থাকবে না)
  compact?: boolean;
}

// মালিকের কাছে hidden হওয়ার কারণ দেখায়
const ModerationNotice = ({ notice, compact = false }: Props) => {
  if (!notice?.message) return null;

  return (
    <View
      className={`flex-row items-start gap-2       ${
        compact ? "mb-2" : "mx-4 mb-3"
      }`}
    >
      <Ionicons
        name="alert-circle-outline"
        size={20}
        color="#d97706"
        style={{ marginTop: 1 }}
      />
      <Text className="flex-1 text-[10px] leading-relaxed text-amber-900 dark:text-amber-200">
        {notice.message}
      </Text>
    </View>
  );
};

export default ModerationNotice;
