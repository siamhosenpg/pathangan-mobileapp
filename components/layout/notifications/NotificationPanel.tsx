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
    <View className="flex-1 bg-background dark:bg-dark-background pt-2 ">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4  pb-4 border-border/60 border-b dark:border-dark-border/60">
        <Text className="text-lg font-bold text-text-primary dark:text-dark-text">
          Notifications
        </Text>

        <View className="flex-row gap-3 items-center">
          {/* mark all read */}
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              className="border border-accent rounded-full px-2 py-1"
            >
              <Text className="text-accent text-sm font-semibold">
                Read all
              </Text>
            </TouchableOpacity>
          )}

          {/* delete all */}
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={() => deleteAllNotifications()}
              className="border border-red-500 rounded-full px-2 py-1"
            >
              <Text className="text-red-500 text-sm font-semibold">Clear</Text>
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
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-16 gap-3">
            <Text className="text-4xl">🔔</Text>
            <Text className="text-text dark:text-dark-text font-semibold text-base">
              কোনো বিজ্ঞপ্তি নেই
            </Text>
            <Text className="text-text-secondary dark:text-dark-text-secondary text-sm text-center px-8">
              নতুন কোনো কার্যক্রম হলে এখানে দেখাবে
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default NotificationPanel;
