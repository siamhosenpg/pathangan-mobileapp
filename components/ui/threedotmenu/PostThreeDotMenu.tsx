import NotInterestedIcon from "@/assets/icons/do-not-enter.svg";
import CopyIcon from "@/assets/icons/duplicate.svg";
import EditIcon from "@/assets/icons/file-edit.svg";
import FlagIcon from "@/assets/icons/finish-flag.svg";
import DeleteIcon from "@/assets/icons/trash.svg";
import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useDeletePostMutation } from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

interface Props {
  postId: string;
  postAuthorId: string;
}

interface MenuItemProps {
  Icon: React.FC<SvgProps>;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const ICON_SIZE = 18;
const DANGER_COLOR = "#EF4444";

/* ───────────── Single row ───────────── */
const MenuItem = ({
  Icon,
  title,
  subtitle,
  onPress,
  danger,
  loading,
  disabled,
}: MenuItemProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = danger ? DANGER_COLOR : isDark ? "#9CA3AF" : "#6B7280";

  const iconBg = danger
    ? "bg-red-500/10"
    : "bg-gray-500/10 dark:bg-gray-400/10";

  const titleColor = danger ? "text-red-500" : "text-text dark:text-dark-text";

  const subtitleColor = danger
    ? "text-red-500/70"
    : "text-text-tertiary dark:text-dark-text-tertiary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${iconBg}`}
      >
        {loading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Icon
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={iconColor}
            fill={iconColor}
          />
        )}
      </View>

      <View className="flex-1">
        <Text className={` font-semibold ${titleColor}`} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {!loading && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
};

/* ───────────── Main ───────────── */
const PostThreeDotMenu = ({ postId, postAuthorId }: Props) => {
  const { close, open } = useBottomSheet();
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const isOwnPost =
    currentUser?.id === postAuthorId ||
    (currentUser as any)?._id === postAuthorId;

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const handleCopyLink = () => {
    close();
  };

  const handleEditPost = () => {
    close();
    router.push(`/post/edit/${postId}` as any);
  };

  const handleReport = () => {
    // Replace the menu content with the report sheet
    // (close + reopen causes flicker, so replace directly)
    open(<ReportSheet targetType="post" targetId={postId} />, {
      scrollable: false,
    });
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(postId).unwrap();
      close();
    } catch {}
  };

  return (
    <View className="px-4 pt-1 pb-2">
      <View className="flex flex-col gap-1">
        <MenuItem
          Icon={CopyIcon}
          title={t("copyLink")}
          subtitle={t("copyLinkSub")}
          onPress={handleCopyLink}
          disabled={isDeleting}
        />

        <MenuItem
          Icon={NotInterestedIcon}
          title={t("notInterested")}
          subtitle={t("notInterestedSub")}
          onPress={close}
          disabled={isDeleting}
        />

        {isOwnPost && (
          <MenuItem
            Icon={EditIcon}
            title={t("editPost")}
            subtitle={t("editPostSub")}
            onPress={handleEditPost}
            disabled={isDeleting}
          />
        )}

        <View className="h-px bg-border dark:bg-dark-border my-1 mx-3" />

        <MenuItem
          Icon={FlagIcon}
          title={t("reportPost")}
          subtitle={t("reportPostSub")}
          onPress={handleReport}
          disabled={isDeleting}
          danger
        />

        {isOwnPost && (
          <MenuItem
            Icon={DeleteIcon}
            title={isDeleting ? t("deleteing") : t("deletePost")}
            subtitle={t("deletePostSub")}
            onPress={handleDeletePost}
            loading={isDeleting}
            danger
          />
        )}
      </View>
    </View>
  );
};

export default PostThreeDotMenu;
