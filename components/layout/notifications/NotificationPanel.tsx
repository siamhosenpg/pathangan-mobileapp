import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import NotificationCard from "./NotificationCard";

import {
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
  useGetMyNotificationsInfiniteQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/redux/api/notification/notificationApi";

const NotificationPanel = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMyNotificationsInfiniteQuery({ limit: 10 });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background pt-4">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text className="text-lg font-bold text-text-primary dark:text-dark-text">
          Notifications
        </Text>

        <View className="flex-row gap-3 items-center">
          {/* mark all read */}
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllAsRead()}>
              <Text className="text-accent text-xs font-semibold">
                Read all
              </Text>
            </TouchableOpacity>
          )}

          {/* delete all */}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={() => deleteAllNotifications()}>
              <Text className="text-red-500 text-xs font-semibold">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onRead={(id) => markAsRead(id)}
            onDelete={(id) => deleteNotification(id)}
          />
        )}
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null
        }
      />
    </View>
  );
};

export default NotificationPanel;
