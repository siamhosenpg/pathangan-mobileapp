import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import type { ReportTargetType } from "@/redux/api/others/reportApi";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import ReportSheet from "./report/ReportSheet";

interface Props {
  targetType: Extract<ReportTargetType, "private_question" | "answer">;
  targetId: string;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PrivateContentMenuSheet = ({
  targetType,
  targetId,
  isOwner,
  onEdit,
  onDelete,
}: Props) => {
  const { t } = useTranslation();
  const { replace, close } = useBottomSheet();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // sheet বন্ধ হওয়ার animation শেষ হলে action চালাই
  const handleEdit = () => {
    close();
    setTimeout(() => onEdit?.(), 280);
  };

  const handleDelete = () => {
    close();
    setTimeout(() => onDelete?.(), 300);
  };

  // menu এর জায়গায় ReportSheet বসবে
  const handleReport = () => {
    replace(<ReportSheet targetType={targetType} targetId={targetId} />, {
      scrollable: false,
    });
  };

  return (
    <View className="px-4 pb-2 gap-1">
      {isOwner ? (
        <>
          <TouchableOpacity
            onPress={handleEdit}
            activeOpacity={0.7}
            className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
          >
            <View className="w-9 h-9 rounded-full items-center justify-center bg-gray-500/10 dark:bg-gray-400/10">
              <Ionicons
                name="create-outline"
                size={18}
                color={isDark ? "#f1f1f1" : "#1b1b1b"}
              />
            </View>
            <Text className="flex-1 text-sm font-medium text-text dark:text-dark-text">
              {t("privateData.editMenu")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
          >
            <View className="w-9 h-9 rounded-full items-center justify-center bg-red-500/10">
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </View>
            <Text className="flex-1 text-sm font-medium text-red-500">
              {t("privateData.deleteMenu")}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={handleReport}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
        >
          <View className="w-9 h-9 rounded-full items-center justify-center bg-red-500/10">
            <Ionicons name="flag-outline" size={18} color="#ef4444" />
          </View>
          <Text className="flex-1 text-sm font-medium text-red-500">
            {t("privateData.reportMenu")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PrivateContentMenuSheet;
