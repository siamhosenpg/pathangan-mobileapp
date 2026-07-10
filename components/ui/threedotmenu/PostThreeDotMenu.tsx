import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useDeletePostMutation } from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface Props {
  postId: string;
  postAuthorId: string;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}

const PostThreeDotMenu = ({ postId, postAuthorId }: Props) => {
  const { close } = useBottomSheet();
  const currentUser = useAppSelector((state) => state.auth.user);

  // ✅ id এবং _id দুইটাই check
  const isOwnPost =
    currentUser?.id === postAuthorId ||
    (currentUser as any)?._id === postAuthorId;

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const { t } = useTranslation();
  const handleCopyLink = () => {
    close();
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
      title: t("copyLink"),
      subtitle: t("copyLinkSub"),
      onPress: handleCopyLink,
    },
    {
      icon: "eye-off",
      title: t("notInterested"),
      subtitle: t("notInterestedSub"),
      onPress: close,
    },
    {
      icon: "flag",
      title: t("reportPost"),
      subtitle: t("reportPostSub"),
      onPress: close,
    },
  ];

  if (isOwnPost) {
    menuItems.push({
      icon: "trash",
      title: t("deletePost"),
      subtitle: t("deletePostSub"),
      onPress: handleDeletePost,
      danger: true,
    });
  }

  return (
    <View className="px-4 pt-1 pb-2">
      {/* Menu Items */}
      <Text className=" font-semibold text-text dark:text-dark-text mb-2 w-full text-center">
        {t("postOptions")}
      </Text>
      <View className="py-2 flex flex-col gap-3 bg-background dark:bg-dark-background rounded-2xl">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.danger && (
              <View className="h-px bg-border dark:bg-dark-border my-2 mx-1" />
            )}
            <TouchableOpacity
              onPress={item.onPress}
              activeOpacity={0.9}
              disabled={isDeleting}
              className={`flex-row items-start gap-4 px-3 py-2.5 rounded-2xl mb-0.5 `}
            >
              <View
                className=" mt-1"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 2,
                }}
              >
                {item.danger && isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={item.danger ? "#EF4444" : "#374151"}
                  />
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={` font-semibold leading-5 ${
                    item.danger
                      ? "text-red-500"
                      : "text-text dark:text-dark-text"
                  }`}
                >
                  {item.danger && isDeleting ? t("deleteing") : item.title}
                </Text>
                <Text
                  className={`text-sm font-medium  mt-0.5 ${
                    item.danger
                      ? "text-red-500"
                      : "text-text-tertiary dark:text-dark-text-tertiary"
                  }`}
                >
                  {item.subtitle}
                </Text>
              </View>

              {!(item.danger && isDeleting) && (
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default PostThreeDotMenu;
