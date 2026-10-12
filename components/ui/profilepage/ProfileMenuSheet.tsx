import {
  default as CheckIcon,
  default as ChevronIcon,
} from "@/assets/icons/angle-small-right.svg";
import FlagIcon from "@/assets/icons/finish-flag.svg";
import ShareIcon from "@/assets/icons/redo.svg";
import UserAddIcon from "@/assets/icons/user-add.svg";
import BanIcon from "@/assets/icons/user-lock.svg";
import UserRemoveIcon from "@/assets/icons/user-unlock.svg";
import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useBlockActions } from "@/hooks/block/useBlockActions";
import { useFollowState } from "@/hooks/useFollowState";
import { useGetBlockStatusQuery } from "@/redux/api/blockApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SvgProps } from "react-native-svg";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

// TODO: put your real app/web profile URL here
const PROFILE_BASE_URL = "https://pathangan.com/profile";
const ACCENT = "#00914d";

interface Props {
  userId: string; // mongo _id (used for follow/unfollow, block and report targetId)
  username: string;
  name: string;
  bio?: string;
  profileImage?: string | null; // block করলে blocked লিস্টে সাথে সাথে ছবি দেখানোর জন্য
}

interface MenuItemProps {
  icon: React.FC<SvgProps>;
  label: string;
  onPress: () => void;
  danger?: boolean;
  accent?: boolean;
  loading?: boolean;
}

const MenuItem = ({
  icon: Icon,
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
        ? "#f1f1f1"
        : "#111111";

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
      className="flex-row items-center gap-3 px-3 py-4 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
    >
      <View className={` rounded-full items-center justify-center `}>
        <Icon width={18} height={18} color={iconColor} />
      </View>

      <Text className={`flex-1  font-semibold ${labelColor}`}>{label}</Text>

      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <ChevronIcon
          width={18}
          height={18}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
};

const ProfileMenuSheet = ({
  userId,
  username,
  name,
  bio,
  profileImage,
}: Props) => {
  const { open, close } = useBottomSheet();
  const { t } = useTranslation();

  // Live follow state, shared with FollowButtonProfile
  const { isFollowing, isReady, toggle } = useFollowState(userId);

  // Block state (optimistic cache থেকে আসে)
  const { data: blockStatus, isLoading: blockLoading } =
    useGetBlockStatusQuery(userId);
  const isBlocked = blockStatus?.blockedByMe ?? false;
  const { confirmBlock, confirmUnblock } = useBlockActions();

  const runToggle = async () => {
    const wasFollowing = isFollowing;
    close(); // optimistic: close right away, UI is already updated
    try {
      await toggle();
    } catch (err) {
      Alert.alert(
        wasFollowing
          ? t("profileMenu.unfollowFailed")
          : t("profileMenu.followFailed"),
        getErrorMessage(err),
      );
    }
  };

  const handleFollowPress = () => {
    if (!isReady) return;

    if (isFollowing) {
      // Confirm before unfollowing
      Alert.alert(
        t("profileMenu.unfollowConfirmTitle"),
        t("profileMenu.unfollowConfirmMessage", { name }),
        [
          { text: t("profileMenu.cancel"), style: "cancel" },
          {
            text: t("profileMenu.unfollowAction"),
            style: "destructive",
            onPress: runToggle,
          },
        ],
      );
      return;
    }

    runToggle();
  };

  const handleShare = async () => {
    close();
    try {
      await Share.share({
        message: t("profileMenu.shareMessage", {
          name,
          username,
          url: `${PROFILE_BASE_URL}/${username}`,
        }),
      });
    } catch {
      // nothing to do if the user cancels or sharing fails
    }
  };

  const handleBlockPress = () => {
    if (blockLoading) return;

    const target = { _id: userId, name, username, profileImage };

    if (isBlocked) {
      confirmUnblock(target, () => close());
      return;
    }

    confirmBlock(target, () => {
      close();
      // ব্লক করা প্রোফাইলে থাকার মানে নেই, পেছনে যাও
      if (router.canGoBack()) router.back();
    });
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
          {bio ? (
            <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {bio}
            </Text>
          ) : (
            <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
              @{username}
            </Text>
          )}
        </Text>
      </View>

      <View className="flex flex-col gap-1">
        <MenuItem
          icon={isFollowing ? UserRemoveIcon : UserAddIcon}
          label={
            isFollowing ? t("profileMenu.unfollow") : t("profileMenu.follow")
          }
          onPress={handleFollowPress}
          accent={!isFollowing}
          loading={!isReady}
        />

        <MenuItem
          icon={ShareIcon}
          label={t("profileMenu.shareProfile")}
          onPress={handleShare}
        />

        <View className="h-px bg-border dark:bg-dark-border my-1 mx-3" />

        <MenuItem
          icon={isBlocked ? CheckIcon : BanIcon}
          label={
            isBlocked ? t("blockedData.unblockMenu") : t("blockedData.block")
          }
          onPress={handleBlockPress}
          danger={!isBlocked}
          accent={isBlocked}
          loading={blockLoading}
        />

        <MenuItem
          icon={FlagIcon}
          label={t("profileMenu.reportProfile")}
          onPress={handleReport}
          danger
        />
      </View>
    </View>
  );
};

export default ProfileMenuSheet;
