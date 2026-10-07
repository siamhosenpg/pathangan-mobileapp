import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  FlatList,
  LayoutAnimation,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import NotificationCard from "./NotificationCard";

import {
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
  useGetMyNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/redux/api/notification/notificationApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface PanelProps {
  // card-এ ক্লিক করে নেভিগেট করার সময় panel বন্ধ করতে
  onClose?: () => void;
}

// ===================== SKELETON =====================
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

// ===================== HEADER ICON BUTTON =====================
// disabled হলে button থাকবে, শুধু হালকা (ফিকে) দেখাবে
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  borderClass: string;
}

const HeaderIconButton = ({
  icon,
  color,
  onPress,
  disabled,
  borderClass,
}: IconButtonProps) => {
  const opacity = useRef(new Animated.Value(disabled ? 0.3 : 1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: disabled ? 0.3 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [disabled, opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        hitSlop={6}
        className={`w-9 h-9 rounded-full border items-center justify-center ${borderClass}`}
      >
        <Ionicons name={icon} size={18} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const animateLayout = () =>
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

const NotificationPanel = ({ onClose }: PanelProps) => {
  const { t } = useTranslation();

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

  // badge-এর সাথে একই count (optimistic update-এ এটাও বদলায়)
  const { data: countData } = useGetUnreadNotificationCountQuery();

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? [];

  const hasUnread =
    notifications.some((n) => !n.read) || (countData?.count ?? 0) > 0;
  const hasAny = notifications.length > 0;

  const showFullError = !isLoading && isError && notifications.length === 0;

  // সফল হলে true, fail করলে alert দেখিয়ে false
  const runAction = async (
    action: () => Promise<unknown>,
  ): Promise<boolean> => {
    try {
      await action();
      return true;
    } catch (err) {
      Alert.alert(t("notificationData.errorTitle"), getErrorMessage(err));
      return false;
    }
  };

  const handleEndReached = () => {
    if (isFetchNextPageError) return;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // ---------- handlers ----------
  const handleMarkAll = () => {
    if (!hasUnread) return;
    runAction(() => markAllAsRead().unwrap());
  };

  const handleDeleteAll = () => {
    if (!hasAny) return;

    Alert.alert(
      t("notificationData.deleteAllTitle"),
      t("notificationData.deleteAllMessage"),
      [
        { text: t("notificationData.cancel"), style: "cancel" },
        {
          text: t("notificationData.deleteAll"),
          style: "destructive",
          onPress: () => {
            animateLayout();
            runAction(() => deleteAllNotifications().unwrap());
          },
        },
      ],
    );
  };

  const handleDelete = async (id: string) => {
    animateLayout(); // নিচের item গুলো মসৃণভাবে উপরে উঠে আসবে
    return runAction(() => deleteNotification(id).unwrap());
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return <NotificationSkeletonItem />;
    }

    if (isFetchNextPageError) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            {t("notificationData.loadMoreFailed")}
          </Text>
          <TouchableOpacity
            onPress={() => fetchNextPage()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {t("notificationData.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={{ flexShrink: 1 }} className="pt-2">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-4 border-border/60 border-b dark:border-dark-border/60">
        <Text className="text-lg font-bold text-text dark:text-dark-text">
          {t("notificationData.title")}
        </Text>

        <View className="flex-row gap-2 items-center">
          <HeaderIconButton
            icon="checkmark-done-outline"
            color="#00914d"
            borderClass="border-accent"
            onPress={handleMarkAll}
            disabled={!hasUnread}
          />
          <HeaderIconButton
            icon="trash-outline"
            color="#EF4444"
            borderClass="border-red-500"
            onPress={handleDeleteAll}
            disabled={!hasAny}
          />
        </View>
      </View>

      {/* Loading */}
      {isLoading && <NotificationSkeletonList />}

      {/* Error */}
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
              {t("notificationData.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIST */}
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
              // fail করলে optimistic update নিজেই rollback হয়, তাই চুপচাপ
              onRead={(id) => {
                markAsRead(id);
              }}
              onDelete={handleDelete}
              onNavigate={onClose}
            />
          )}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 gap-3">
              <Text className="text-4xl">🔔</Text>
              <Text className="text-text dark:text-dark-text font-semibold text-base">
                {t("notificationData.empty")}
              </Text>
              <Text className="text-text-secondary dark:text-dark-text-secondary text-sm text-center px-8">
                {t("notificationData.emptyDesc")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default NotificationPanel;
