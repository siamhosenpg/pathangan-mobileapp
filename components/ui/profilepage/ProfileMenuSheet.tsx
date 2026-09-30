import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useFollowState } from "@/hooks/useFollowState";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import {
  ActivityIndicator,
  Alert,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

// TODO: put your real app/web profile URL here
const PROFILE_BASE_URL = "https://pathangan.com/profile";
const ACCENT = "#00914d";

interface Props {
  userId: string; // mongo _id (used for follow/unfollow and report targetId)
  username: string;
  name: string;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  accent?: boolean;
  loading?: boolean;
}

const MenuItem = ({
  icon,
  label,
  onPress,
  danger,
  accent,
  loading,
}: MenuItemProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = danger
    ? "#EF4444"
    : accent
      ? ACCENT
      : isDark
        ? "#9CA3AF"
        : "#6B7280";

  const iconBg = danger
    ? "bg-red-500/10"
    : accent
      ? "bg-accent/10"
      : "bg-gray-500/10 dark:bg-gray-400/10";

  const labelColor = danger
    ? "text-red-500"
    : accent
      ? "text-accent"
      : "text-text dark:text-dark-text";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${iconBg}`}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text className={`flex-1 text-sm font-medium ${labelColor}`}>
        {label}
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
};

const ProfileMenuSheet = ({ userId, username, name }: Props) => {
  const { open, close } = useBottomSheet();

  // Live follow state, shared with FollowButtonProfile
  const { isFollowing, isReady, toggle } = useFollowState(userId);

  const runToggle = async () => {
    const wasFollowing = isFollowing;
    close(); // optimistic: close right away, UI is already updated
    try {
      await toggle();
    } catch (err) {
      Alert.alert(
        wasFollowing ? "আনফলো করা যায়নি" : "ফলো করা যায়নি",
        getErrorMessage(err),
      );
    }
  };

  const handleFollowPress = () => {
    if (!isReady) return;

    if (isFollowing) {
      // Confirm before unfollowing
      Alert.alert("আনফলো করবেন?", `${name} কে আনফলো করতে চান?`, [
        { text: "বাতিল", style: "cancel" },
        { text: "আনফলো", style: "destructive", onPress: runToggle },
      ]);
      return;
    }

    runToggle();
  };

  const handleShare = async () => {
    close();
    try {
      await Share.share({
        message: `${name} (@${username}) এর প্রোফাইল দেখো: ${PROFILE_BASE_URL}/${username}`,
      });
    } catch {
      // nothing to do if the user cancels or sharing fails
    }
  };

  const handleReport = () => {
    // Replace the menu content with the report sheet
    // (close + reopen causes flicker, so replace directly)
    open(<ReportSheet targetType="user" targetId={userId} />, {
      scrollable: false,
    });
  };

  return (
    <View className="px-4 pb-2">
      {/* Profile info */}
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
          icon={isFollowing ? "person-remove-outline" : "person-add-outline"}
          label={isFollowing ? "আনফলো করুন" : "ফলো করুন"}
          onPress={handleFollowPress}
          accent={!isFollowing}
          loading={!isReady}
        />

        <MenuItem
          icon="share-social-outline"
          label="প্রোফাইল শেয়ার করো"
          onPress={handleShare}
        />

        <View className="h-px bg-border dark:bg-dark-border my-1 mx-3" />

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
