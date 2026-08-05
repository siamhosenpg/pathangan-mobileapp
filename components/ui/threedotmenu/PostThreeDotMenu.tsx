import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useDeletePostMutation } from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

interface Props {
  postId: string;
  postAuthorId: string;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}

const PostThreeDotMenu = ({ postId, postAuthorId }: Props) => {
  const { close, open } = useBottomSheet(); // ← এখন open ও আছে
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ✅ id এবং _id দুইটাই check
  const isOwnPost =
    currentUser?.id === postAuthorId ||
    (currentUser as any)?._id === postAuthorId;

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const { t } = useTranslation();

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
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: "link",
      iconBg: "bg-accent/10 dark:bg-accent/15",
      iconColor: "#00914d",
      title: t("copyLink"),
      subtitle: t("copyLinkSub"),
      onPress: handleCopyLink,
    },
    {
      icon: "eye-off",
      iconBg: "bg-gray-500/10 dark:bg-gray-400/10",
      iconColor: isDark ? "#9CA3AF" : "#6B7280",
      title: t("notInterested"),
      subtitle: t("notInterestedSub"),
      onPress: close,
    },
    {
      icon: "flag",
      iconBg: "bg-amber-500/10",
      iconColor: "#F59E0B",
      title: t("reportPost"),
      subtitle: t("reportPostSub"),
      onPress: () => open(<ReportSheet targetType="post" targetId={postId} />),
    },
  ];

  if (isOwnPost) {
    menuItems.push({
      icon: "create-outline",
      iconBg: "bg-blue-500/10",
      iconColor: "#3B82F6",
      title: t("editPost") ?? "সম্পাদনা করুন",
      subtitle: t("editPostSub") ?? "তোমার পোস্ট পরিবর্তন করো",
      onPress: handleEditPost,
    });

    menuItems.push({
      icon: "trash",
      iconBg: "bg-red-500/10",
      iconColor: "#EF4444",
      title: t("deletePost"),
      subtitle: t("deletePostSub"),
      onPress: handleDeletePost,
      danger: true,
    });
  }

  return (
    <View className="px-4 pt-1 pb-2">
      {/* Header */}
      <View className="items-center mb-3">
        <View className="w-10 h-1 rounded-full bg-border dark:bg-dark-border mb-3" />
        <Text className="text-base font-bold text-text dark:text-dark-text">
          {t("postOptions")}
        </Text>
      </View>

      {/* Menu Items */}
      <View className="flex flex-col gap-1.5">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.danger && (
              <View className="h-px bg-border dark:bg-dark-border my-2 mx-1" />
            )}
            <TouchableOpacity
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={isDeleting}
              className="flex-row items-center gap-3.5 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
            >
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${item.danger ? "bg-red-500/10" : item.iconBg}`}
              >
                {item.danger && isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? "#EF4444" : item.iconColor}
                  />
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={`text-[15px] font-semibold leading-5 ${
                    item.danger
                      ? "text-red-500"
                      : "text-text dark:text-dark-text"
                  }`}
                >
                  {item.danger && isDeleting ? t("deleteing") : item.title}
                </Text>
                <Text
                  className={`text-xs font-medium mt-0.5 ${
                    item.danger
                      ? "text-red-500/70"
                      : "text-text-tertiary dark:text-dark-text-tertiary"
                  }`}
                >
                  {item.subtitle}
                </Text>
              </View>

              {!(item.danger && isDeleting) && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? "#3f3f3f" : "#D1D5DB"}
                />
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default PostThreeDotMenu;
