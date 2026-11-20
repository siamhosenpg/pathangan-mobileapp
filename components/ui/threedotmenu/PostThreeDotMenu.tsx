import {
  CopyIcon,
  EditIcon,
  FlagIcon,
  NotInterestedIcon,
  TrashIcon,
} from "@/assets/icon";
import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useNotInterestedMutation } from "@/redux/api/feedApi";
import { useDeletePostMutation } from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

interface Props {
  postId: string;
  // author ডিলিট হয়ে গেলে null আসতে পারে
  postAuthorId?: string | null;
}

interface MenuItemProps {
  Icon: React.FC<SvgProps>;
  title: string;
  subtitle: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const ICON_SIZE = 18;

/* তোমার ওয়েবসাইটের আসল ডোমেইন এখানে বসাও (শেষে / দিও না) */
const WEB_BASE_URL = "https://pathangan.com";

/* ───────────── Single row ───────────── */
const MenuItem = ({
  Icon,
  title,
  subtitle,
  onPress,
  loading,
  disabled,
}: MenuItemProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // সব আইটেমের আইকনের রং একই
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
    >
      <View className="w-9 h-9 rounded-full items-center justify-center bg-gray-500/10 dark:bg-gray-400/10">
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
        <Text
          className="font-semibold text-text dark:text-dark-text"
          numberOfLines={1}
        >
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

  // author না থাকলে (ডিলিট করা user) কখনোই নিজের পোস্ট না
  // দুই দিকেই String করে তুলনা করি, যাতে ObjectId/string মিসম্যাচ না হয়
  const currentUserId = currentUser?.id ?? (currentUser as any)?._id;
  const isOwnPost =
    !!postAuthorId &&
    !!currentUserId &&
    String(currentUserId) === String(postAuthorId);

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [notInterested] = useNotInterestedMutation();

  /* লিংক কপি করে, সফল হলে হ্যাপটিক দেয় */
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(`${WEB_BASE_URL}/post/${postId}`);
      // কপি হওয়ার সঙ্গে সঙ্গে হালকা কম্পন (সফল)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // কপি ব্যর্থ হলে error হ্যাপটিক
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      close();
    }
  };

  // post সঙ্গে সঙ্গে ফিড থেকে সরে যায় (optimistic), ব্যর্থ হলে ফিরে আসে
  const handleNotInterested = () => {
    close();
    void notInterested(postId);
  };

  const handleEditPost = () => {
    close();
    router.push(`/post/edit/${postId}` as any);
  };

  const handleReport = () => {
    // নিজের পোস্ট রিপোর্ট করা যাবে না (UI তে লুকানো, এখানেও গার্ড)
    if (isOwnPost) return;

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

        {/* নিজের পোস্টে "আগ্রহী নই" অর্থহীন */}
        {!isOwnPost && (
          <MenuItem
            Icon={NotInterestedIcon}
            title={t("notInterested")}
            subtitle={t("notInterestedSub")}
            onPress={handleNotInterested}
            disabled={isDeleting}
          />
        )}

        {isOwnPost && (
          <MenuItem
            Icon={EditIcon}
            title={t("editPost")}
            subtitle={t("editPostSub")}
            onPress={handleEditPost}
            disabled={isDeleting}
          />
        )}

        {/* নিজের পোস্টে রিপোর্ট নেই, তাই divider আর রিপোর্ট শুধু অন্যের পোস্টে */}
        {!isOwnPost && (
          <>
            <View className="h-px bg-border dark:bg-dark-border my-1 mx-3" />

            <MenuItem
              Icon={FlagIcon}
              title={t("reportPost")}
              subtitle={t("reportPostSub")}
              onPress={handleReport}
              disabled={isDeleting}
            />
          </>
        )}

        {isOwnPost && (
          <>
            <View className="h-px bg-border dark:bg-dark-border my-1 mx-3" />

            <MenuItem
              Icon={TrashIcon}
              title={isDeleting ? t("deleteing") : t("deletePost")}
              subtitle={t("deletePostSub")}
              onPress={handleDeletePost}
              loading={isDeleting}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default PostThreeDotMenu;
