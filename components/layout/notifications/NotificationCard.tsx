import GreenMark from "@/components/ui/badges/GreenMark";
import { Notification } from "@/types/notification/notificationTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TFn = (key: string, options?: Record<string, unknown>) => string;

interface Props {
  item: Notification;
  onRead: (id: string) => void;
  // true ফেরত দিলে delete সফল, false হলে fail (card আবার ফিরে আসবে)
  onDelete: (id: string) => Promise<boolean>;
  // নেভিগেট করার আগে panel বন্ধ করার জন্য
  onNavigate?: () => void;
}

const getText = (type: Notification["type"], t: TFn) => {
  switch (type) {
    case "like":
      return t("notificationData.reactedToYourPost");
    case "comment":
      return t("notificationData.commentedOnYourPost");
    case "follow":
      return t("notificationData.followingYou");
    case "share":
      return t("notificationData.sharedYourPost");
    default:
      return "";
  }
};

// type অনুযায়ী avatar-এর কোণায় ছোট badge-এর icon ও রঙ
const getTypeBadge = (
  type: Notification["type"],
): { icon: keyof typeof Ionicons.glyphMap; color: string } | null => {
  switch (type) {
    case "like":
      return { icon: "heart", color: "#EF4444" };
    case "comment":
      return { icon: "chatbubble", color: "#3B82F6" };
    case "follow":
      return { icon: "person-add", color: "#00914d" };
    case "share":
      return { icon: "arrow-redo", color: "#F59E0B" };
    default:
      return null;
  }
};

const timeAgo = (date: string, t: TFn) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return t("notificationData.justNow");
  if (mins < 60) return t("notificationData.minutesAgo", { value: mins });

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("notificationData.hoursAgo", { value: hrs });

  return t("notificationData.daysAgo", { value: Math.floor(hrs / 24) });
};

// follow  -> যে follow করেছে তার profile
// like / comment / share -> সংশ্লিষ্ট post
const getNavigationPath = (notification: Notification): string | null => {
  const { type, actorId, target } = notification;

  if (type === "follow") {
    return actorId?.username ? `/${actorId.username}` : null;
  }

  if (
    (type === "like" || type === "comment" || type === "share") &&
    target?.postId
  ) {
    return `/post/${target.postId}`;
  }

  return null;
};

const NotificationCard = ({ item, onRead, onDelete, onNavigate }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();

  // ---------- animations ----------
  const enterOpacity = useRef(new Animated.Value(0)).current; // fade-in
  const exitOpacity = useRef(new Animated.Value(1)).current; // delete-এর সময়
  const exitX = useRef(new Animated.Value(0)).current;
  const unreadDot = useRef(new Animated.Value(item.read ? 0 : 1)).current;
  const deleting = useRef(false);

  // প্রথমবার দেখা দিলে হালকা fade-in
  useEffect(() => {
    Animated.timing(enterOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [enterOpacity]);

  // read হলে বাঁ পাশের bubble ধীরে ধীরে ছোট হয়ে মিলিয়ে যাবে
  useEffect(() => {
    Animated.timing(unreadDot, {
      toValue: item.read ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [item.read, unreadDot]);

  const handlePress = () => {
    // আগে থেকে read হলে অকারণে request পাঠাবো না
    if (!item.read) onRead(item._id);

    const path = getNavigationPath(item);
    if (!path) return;

    // আগে panel বন্ধ, তারপর নেভিগেশন
    onNavigate?.();
    router.push(path as any);
  };

  const handleDelete = () => {
    if (deleting.current) return;
    deleting.current = true;

    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(exitX, {
        toValue: 40,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      const ok = await onDelete(item._id);

      // fail করলে item ফিরে আসে, তাই animation-ও ফিরিয়ে আনতে হবে
      if (!ok) {
        deleting.current = false;
        Animated.parallel([
          Animated.timing(exitOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(exitX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  };

  const badge = getTypeBadge(item.type);

  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(enterOpacity, exitOpacity),
        transform: [{ translateX: exitX }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        className="flex-row items-start pl-7 pr-4 py-3.5 gap-3 border-b border-border/40 dark:border-dark-border/40"
      >
        {/* unread bubble (বাঁ পাশে, animated) */}
        <Animated.View
          pointerEvents="none"
          className="bg-accent"
          style={{
            position: "absolute",
            left: 11,
            top: 33,
            width: 10,
            height: 10,
            borderRadius: 5,
            opacity: unreadDot,
            transform: [{ scale: unreadDot }],
          }}
        />

        {/* avatar + type badge */}
        <View className="w-12 h-12">
          <View className="w-12 h-12 rounded-full bg-accent/30 items-center justify-center overflow-hidden">
            {item.actorId?.profileImage ? (
              <Image
                source={{ uri: item.actorId.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="font-bold text-accent">
                {item.actorId?.name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            )}
          </View>

          {badge && (
            <View
              className="absolute items-center justify-center rounded-full border-2 border-background dark:border-dark-background"
              style={{
                right: -4,
                bottom: -4,
                width: 22,
                height: 22,
                backgroundColor: badge.color,
              }}
            >
              <Ionicons name={badge.icon} size={11} color="#fff" />
            </View>
          )}
        </View>

        {/* content */}
        <View className="flex-1">
          <View>
            <View className="flex-row items-center gap-1">
              <Text
                className={`text-sm text-text dark:text-dark-text ${
                  item.read ? "font-semibold" : "font-bold"
                }`}
              >
                {item.actorId?.name ?? item.actorId?.username ?? "Deleted User"}
              </Text>
              <GreenMark
                mark={item.actorId?.greenmarkVerified || false}
                size={16}
              />
            </View>
            <Text
              className={`font-medium ${
                item.read
                  ? "text-text-secondary dark:text-dark-text-secondary"
                  : "text-text dark:text-dark-text"
              }`}
            >
              {getText(item.type, t)}
            </Text>
          </View>

          <Text
            className={`text-xs font-medium mt-1 ${
              item.read
                ? "text-text-tertiary dark:text-dark-text-tertiary"
                : "text-accent"
            }`}
          >
            {timeAgo(item.createdAt, t)}
          </Text>
        </View>

        {/* delete */}
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={8}
          className="p-1.5 border-border border rounded-full"
        >
          <Ionicons name="close" size={16} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationCard;
