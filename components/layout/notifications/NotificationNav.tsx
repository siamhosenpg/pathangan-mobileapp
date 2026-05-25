import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

import NotificationBadge from "./NotificationBadge";
import NotificationPanel from "./NotificationPanel";

import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";

import { useGetUnreadNotificationCountQuery } from "@/redux/api/notification/notificationApi";

const NotificationNav = () => {
  const { open } = useBottomSheet();

  const { data } = useGetUnreadNotificationCountQuery();

  const unreadCount = data?.count ?? 0;

  const handleOpen = () => {
    open(<NotificationPanel />);
  };

  return (
    <Pressable onPress={handleOpen}>
      <View
        style={{
          position: "relative",
        }}
      >
        <Ionicons name="notifications-outline" size={28} color="white" />

        <NotificationBadge count={unreadCount} />
      </View>
    </Pressable>
  );
};

export default NotificationNav;
