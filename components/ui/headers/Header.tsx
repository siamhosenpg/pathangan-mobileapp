import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import AddIcon from "@/assets/icons/add.svg";
import BellIcon from "@/assets/icons/bell.svg";
import { useDrawer } from "@/components/layout/menu/DrawerContext";
import NotificationBadge from "@/components/layout/notifications/NotificationBadge";
import NotificationPanel from "@/components/layout/notifications/NotificationPanel";
import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import { useGetUnreadNotificationCountQuery } from "@/redux/api/notification/notificationApi";
import { useAppSelector } from "@/redux/hooks";
import { useColorScheme } from "nativewind";
import ProfileImage from "../avatar/ProfileImage";

interface HeaderProps {
  title?: string;
  // Header-এর নিচে যা বসবে (যেমন FeedTabs)। না দিলে আগের মতোই থাকবে
  bottom?: ReactNode;
}

export function Header({ title, bottom }: HeaderProps) {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  const { open } = useBottomSheet();
  const user = useAppSelector((state) => state.auth.user);
  const isDeletedUser = !user;

  const { data } = useGetUnreadNotificationCountQuery();
  const unreadCount = data?.count ?? 0;

  const handleCreatePost = () => {
    router.push("/(pages)/post/create");
  };

  return (
    // bottom (tabs) থাকলে border টা tabs-এর নিচে বসবে, তাই এখানে দেওয়া হয়নি
    <View
      className={`bg-background dark:bg-dark-background ${
        bottom ? "" : "border-b border-border dark:border-dark-border"
      }`}
    >
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 mr-3">
            {/* menu button — icon এর বদলে profile image */}
            <TouchableOpacity onPress={openDrawer}>
              <ProfileImage
                uri={user?.profileImage}
                name={user?.name}
                size={30}
                isDeleted={isDeletedUser}
                recyclingKey={user?.id}
              />
            </TouchableOpacity>

            <View className="flex-shrink">
              <Text
                className="text-lg font-bold text-text dark:text-dark-text"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title ?? user?.name}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-5 items-center">
            <TouchableOpacity onPress={handleCreatePost}>
              <View>
                <AddIcon width={22} height={22} color={iconColor} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => open(<NotificationPanel />, { scrollable: false })}
            >
              <View style={{ position: "relative" }}>
                <BellIcon width={22} height={22} color={iconColor} />
                <NotificationBadge count={unreadCount} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Header-এর ভেতরেই tabs বসবে */}
      {bottom}
    </View>
  );
}
