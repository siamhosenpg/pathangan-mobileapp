// PostThreeDotMenu.tsx
import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useDeletePostMutation } from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwnPost = currentUserId === postAuthorId;

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

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
      icon: "help-circle-outline",
      title: "কেন এই পোস্টটি দেখছি?",
      subtitle: "এই পোস্টটি কেন দেখানো হচ্ছে তা জানুন",
      onPress: close,
    },
    {
      icon: "link-outline",
      title: "লিংক কপি করুন",
      subtitle: "এই পোস্টের লিংক কপি করুন",
      onPress: handleCopyLink,
    },
    {
      icon: "eye-off-outline",
      title: "আগ্রহী নই",
      subtitle: "এই ধরনের পোস্ট কম দেখাও",
      onPress: close,
    },
    {
      icon: "flag-outline",
      title: "পোস্ট রিপোর্ট করুন",
      subtitle: "এই পোস্টটি নিয়ে আমি উদ্বিগ্ন",
      onPress: close,
    },
  ];

  if (isOwnPost) {
    menuItems.push({
      icon: "trash-outline",
      title: "পোস্ট ডিলিট করুন",
      subtitle: "এই পোস্টটি স্থায়ীভাবে মুছে ফেলুন",
      onPress: handleDeletePost,
      danger: true,
    });
  }

  return (
    <View className="px-3 pt-1 pb-2">
      {/* Header */}
      <View className="px-3 py-3 mb-1 border-b border-border dark:border-dark-border">
        <Text className="text-base font-bold text-text dark:text-dark-text">
          পোস্ট অপশন
        </Text>
      </View>

      {/* Menu Items */}
      <View className="pt-2">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.danger && (
              <View className="h-px bg-border dark:bg-dark-border my-2 mx-1" />
            )}
            <TouchableOpacity
              onPress={item.onPress}
              activeOpacity={0.6}
              // delete loading চলাকালে সব button disable
              disabled={isDeleting}
              className={`flex-row items-center gap-3 px-3 py-2.5 rounded-2xl mb-0.5 ${
                item.danger ? "bg-red-500/5" : ""
              }`}
            >
              {/* Icon circle */}
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  item.danger
                    ? "bg-red-500/10"
                    : "bg-background-secondary dark:bg-dark-background-secondary"
                }`}
              >
                {/* delete button এ loading spinner */}
                {item.danger && isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? "#EF4444" : "#374151"}
                  />
                )}
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text
                  className={`text-sm font-semibold leading-5 ${
                    item.danger
                      ? "text-red-500"
                      : "text-text dark:text-dark-text"
                  }`}
                >
                  {item.danger && isDeleting
                    ? "মুছে ফেলা হচ্ছে..."
                    : item.title}
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    item.danger
                      ? "text-red-300"
                      : "text-text-secondary dark:text-dark-text-secondary"
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
