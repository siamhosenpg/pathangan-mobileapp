import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Share, Text, TouchableOpacity, View } from "react-native";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

// TODO: nijer app/web er asol profile URL ekhane boshao
const PROFILE_BASE_URL = "https://pathangan.com/profile";

interface Props {
  userId: string; // mongo _id (report er targetId)
  username: string;
  name: string;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuItem = ({ icon, label, onPress, danger }: MenuItemProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = danger ? "#EF4444" : isDark ? "#9CA3AF" : "#6B7280";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          danger ? "bg-red-500/10" : "bg-gray-500/10 dark:bg-gray-400/10"
        }`}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text
        className={`flex-1 text-sm font-medium ${
          danger ? "text-red-500" : "text-text dark:text-dark-text"
        }`}
      >
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={isDark ? "#6B7280" : "#9CA3AF"}
      />
    </TouchableOpacity>
  );
};

const ProfileMenuSheet = ({ userId, username, name }: Props) => {
  const { open, close } = useBottomSheet();

  const handleShare = async () => {
    close();
    try {
      await Share.share({
        message: `${name} (@${username}) এর প্রোফাইল দেখো: ${PROFILE_BASE_URL}/${username}`,
      });
    } catch {
      // user cancel korle ba error hole kichu korar dorkar nei
    }
  };

  const handleReport = () => {
    // menu sheet er content replace kore report sheet dekhai
    // (close + reopen korle flicker hoy, tai directly replace)
    open(<ReportSheet targetType="user" targetId={userId} />, {
      scrollable: false,
    });
  };

  return (
    <View className="px-4 pb-2">
      <View className="items-center pb-3">
        <Text className="text-base font-bold text-text dark:text-dark-text">
          {name}
        </Text>
        <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
          @{username}
        </Text>
      </View>

      <View className="flex flex-col gap-1">
        <MenuItem
          icon="share-social-outline"
          label="প্রোফাইল শেয়ার করো"
          onPress={handleShare}
        />
        <MenuItem
          icon="flag-outline"
          label="প্রোফাইল রিপোর্ট করো"
          onPress={handleReport}
          danger
        />
      </View>
    </View>
  );
};

export default ProfileMenuSheet;
