import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import ReportSheet from "@/components/ui/bottom-sheet/report/ReportSheet";
import type { ReportTargetType } from "@/redux/api/others/reportApi";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";

// ওয়েবসাইটের আসল domain এখানে বসাও
export const SHARE_BASE_URL = "https://your-domain.com";

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  shareUrl: string;
}

const ContentMenuSheet = ({ targetType, targetId, shareUrl }: Props) => {
  const { open, close } = useBottomSheet();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    close();
    setTimeout(() => {
      Alert.alert(t("contentMenu.linkCopied"));
    }, 300);
  };

  const handleReport = () => {
    // menu এর জায়গায় সরাসরি ReportSheet বসিয়ে দিচ্ছি (sheet খোলা অবস্থাতেই content বদলাবে)
    open(<ReportSheet targetType={targetType} targetId={targetId} />, {
      scrollable: false,
    });
  };

  return (
    <View className="px-4 pb-2 gap-1">
      <TouchableOpacity
        onPress={handleCopyLink}
        activeOpacity={0.7}
        className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
      >
        <View className="w-9 h-9 rounded-full items-center justify-center bg-gray-500/10 dark:bg-gray-400/10">
          <Ionicons
            name="link-outline"
            size={18}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </View>
        <Text className="flex-1 text-sm font-medium text-text dark:text-dark-text">
          {t("contentMenu.copyLink")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleReport}
        activeOpacity={0.7}
        className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
      >
        <View className="w-9 h-9 rounded-full items-center justify-center bg-red-500/10">
          <Ionicons name="flag-outline" size={18} color="#ef4444" />
        </View>
        <Text className="flex-1 text-sm font-medium text-red-500">
          {t("contentMenu.report")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContentMenuSheet;
