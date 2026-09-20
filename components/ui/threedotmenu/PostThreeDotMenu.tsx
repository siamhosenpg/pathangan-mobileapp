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

interface MenuItem {
  key: string;
  Icon: React.FC<SvgProps>;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
}

const ICON_SIZE = 22;
const DANGER_COLOR = "#EF4444";

/* ───────────── Single row ───────────── */
const MenuRow = ({
  item,
  isLast,
  iconColor,
  chevronColor,
  disabled,
}: {
  item: MenuItem;
  isLast: boolean;
  iconColor: string;
  chevronColor: string;
  disabled: boolean;
}) => {
  const color = item.danger ? DANGER_COLOR : iconColor;

  return (
    <>
      <TouchableOpacity
        onPress={item.onPress}
        activeOpacity={0.6}
        disabled={disabled}
        className="flex-row items-center gap-3.5 px-4 py-3.5"
      >
        {/* Icon (no background) */}
        <View className="w-6 items-center justify-center">
          {item.loading ? (
            <ActivityIndicator size="small" color={DANGER_COLOR} />
          ) : (
            <item.Icon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              fill={color}
            />
          )}
        </View>

        {/* Title + subtitle */}
        <View className="flex-1">
          <Text
            className={`text-[15px] font-semibold ${
              item.danger ? "text-red-500" : "text-text dark:text-dark-text"
            }`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${
              item.danger
                ? "text-red-500/70"
                : "text-text-tertiary dark:text-dark-text-tertiary"
            }`}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        </View>

        {/* Chevron */}
        {!item.loading && (
          <Ionicons name="chevron-forward" size={16} color={chevronColor} />
        )}
      </TouchableOpacity>

      {/* Divider, text er sathe align kora */}
      {!isLast && (
        <View
          className="h-px bg-border/60 dark:bg-dark-border/60"
          style={{ marginLeft: 16 + 24 + 14 }}
        />
      )}
    </>
  );
};

/* ───────────── Card (group of rows) ───────────── */
const MenuCard = ({
  items,
  iconColor,
  chevronColor,
  disabled,
}: {
  items: MenuItem[];
  iconColor: string;
  chevronColor: string;
  disabled: boolean;
}) => {
  if (items.length === 0) return null;

  return (
    <View className="rounded-3xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary">
      {items.map((item, index) => (
        <MenuRow
          key={item.key}
          item={item}
          isLast={index === items.length - 1}
          iconColor={iconColor}
          chevronColor={chevronColor}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

/* ───────────── Main ───────────── */
const PostThreeDotMenu = ({ postId, postAuthorId }: Props) => {
  const { close, open } = useBottomSheet();
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
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

  const handleDeletePost = async () => {
    try {
      await deletePost(postId).unwrap();
      close();
    } catch {}
  };

  const iconColor = isDark ? "#E5E7EB" : "#1F2937";
  const chevronColor = isDark ? "#4B5563" : "#C4C9D0";

  // Prothom card: shobar jonno action
  const mainItems: MenuItem[] = [
    {
      key: "copy",
      Icon: CopyIcon,
      title: t("copyLink"),
      subtitle: t("copyLinkSub"),
      onPress: handleCopyLink,
    },
    {
      key: "not-interested",
      Icon: NotInterestedIcon,
      title: t("notInterested"),
      subtitle: t("notInterestedSub"),
      onPress: close,
    },
    {
      key: "report",
      Icon: FlagIcon,
      title: t("reportPost"),
      subtitle: t("reportPostSub"),
      onPress: () =>
        open(<ReportSheet targetType="post" targetId={postId} />, {
          scrollable: false,
        }),
    },
  ];

  if (isOwnPost) {
    mainItems.push({
      key: "edit",
      Icon: EditIcon,
      title: t("editPost"),
      subtitle: t("editPostSub"),
      onPress: handleEditPost,
    });
  }

  // Dwitiyo card: shudhu nijer post hole Delete
  const dangerItems: MenuItem[] = isOwnPost
    ? [
        {
          key: "delete",
          Icon: DeleteIcon,
          title: isDeleting ? t("deleteing") : t("deletePost"),
          subtitle: t("deletePostSub"),
          onPress: handleDeletePost,
          danger: true,
          loading: isDeleting,
        },
      ]
    : [];

  return (
    <View className="px-4 pt-1 pb-2">
      <View className="gap-3">
        <MenuCard
          items={mainItems}
          iconColor={iconColor}
          chevronColor={chevronColor}
          disabled={isDeleting}
        />
        <MenuCard
          items={dangerItems}
          iconColor={iconColor}
          chevronColor={chevronColor}
          disabled={isDeleting}
        />
      </View>
    </View>
  );
};

export default PostThreeDotMenu;
