import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
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
import { getErrorMessage } from "@/utils/getErrorMessage"; // path ঠিক করে নিও

// ===================== SKELETON =====================
// halka pulse animation. Tomar nijer skeleton component thakle
// NotificationSkeletonItem er jaigay seta boshate paro.
const Pulse = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

const NotificationSkeletonItem = () => (
  <Pulse>
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View className="w-11 h-11 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
      <View className="flex-1 gap-2">
        <View className="h-3 w-4/5 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
        <View className="h-3 w-2/5 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
      </View>
    </View>
  </Pulse>
);

const NotificationSkeletonList = () => (
  <View>
    <NotificationSkeletonItem />
    <NotificationSkeletonItem />
    <NotificationSkeletonItem />
    <NotificationSkeletonItem />
  </View>
);

// ===================== ACTION HELPER =====================
// mutation fail korle user ke jani (age kichu dekhato na)
const runAction = async (action: () => Promise<unknown>) => {
  try {
    await action();
  } catch (err) {
    Alert.alert("সমস্যা হয়েছে", getErrorMessage(err));
  }
};

const NotificationPanel = () => {
  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useGetMyNotificationsInfiniteQuery({ limit: 10 });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications, { isLoading: isDeletingAll }] =
    useDeleteAllNotificationsMutation();

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // শুধু তখনই full error, যখন দেখানোর মতো একটা বিজ্ঞপ্তিও নেই
  const showFullError = !isLoading && isError && notifications.length === 0;

  const handleEndReached = () => {
    // next page er error thakle nije nije abar chalabo na,
    // user "আবার চেষ্টা করো" chaple tokhon chalbe
    if (isFetchNextPageError) return;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    // 1) next page ashchhe -> skeleton
    if (isFetchingNextPage) {
      return <NotificationSkeletonItem />;
    }

    // 2) next page fail -> purono bijnopti thakbe, niche shudhu chhoto retry
    if (isFetchNextPageError) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            আরও বিজ্ঞপ্তি লোড করা যায়নি
          </Text>
          <TouchableOpacity
            onPress={() => fetchNextPage()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              আবার চেষ্টা করো
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    // flex-1 remove, flexShrink diye sheet er max height er moddhe shrink hobe
    <View style={{ flexShrink: 1 }} className="pt-2">
      {/* HEADER — loading er somoyo thakbe */}
      <View className="flex-row items-center justify-between px-4 pb-4 border-border/60 border-b dark:border-dark-border/60">
        <Text className="text-lg font-bold text-text dark:text-dark-text">
          Notifications
        </Text>

        <View className="flex-row gap-3 items-center">
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => runAction(() => markAllAsRead().unwrap())}
              disabled={isMarkingAll}
              className={`border border-accent rounded-full px-2 py-1 ${
                isMarkingAll ? "opacity-50" : ""
              }`}
            >
              <Text className="text-accent text-sm font-semibold">
                Read all
              </Text>
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={() => runAction(() => deleteAllNotifications().unwrap())}
              disabled={isDeletingAll}
              className={`border border-red-500 rounded-full px-2 py-1 ${
                isDeletingAll ? "opacity-50" : ""
              }`}
            >
              <Text className="text-red-500 text-sm font-semibold">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading */}
      {isLoading && <NotificationSkeletonList />}

      {/* Error — প্রথমবারেই load fail */}
      {showFullError && (
        <View className="items-center justify-center py-16 px-8 gap-3">
          <Text className="text-4xl">📡</Text>
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            {getErrorMessage(error)}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              আবার চেষ্টা করো
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIST — next page error হলেও পুরনো বিজ্ঞপ্তি গুলো থাকবে */}
      {!isLoading && !showFullError && (
        <FlatList
          style={{ flexShrink: 1 }}
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              // "read" mark fail holeo chupchap, eta chhoto kaj, alert birokto korbe
              onRead={(id) => markAsRead(id)}
              onDelete={(id) =>
                runAction(() => deleteNotification(id).unwrap())
              }
            />
          )}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 gap-3">
              <Text className="text-4xl">🔔</Text>
              <Text className="text-text dark:text-dark-text font-semibold text-base">
                কোনো বিজ্ঞপ্তি নেই
              </Text>
              <Text className="text-text-secondary dark:text-dark-text-secondary text-sm text-center px-8">
                নতুন কোনো কার্যক্রম হলে এখানে দেখাবে
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default NotificationPanel;
