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

interface Props {
  item: Notification;
  onRead: (id: string) => void;
  // true ফেরত দিলে delete সফল, false হলে fail (card আবার ফিরে আসবে)
  onDelete: (id: string) => Promise<boolean>;
}

const getText = (type: Notification["type"], t: (key: string) => string) => {
  switch (type) {
    case "like":
      return t("reactedToYourPost");
    case "comment":
      return t("commentedOnYourPost");
    case "follow":
      return t("followingYou");
    case "share":
      return t("sharedYourPost");
    default:
      return "";
  }
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "এখনই";
  if (mins < 60) return `${mins} মিনিট আগে`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;

  return `${Math.floor(hrs / 24)} দিন আগে`;
};

const getNavigationPath = (notification: Notification): string | null => {
  const { type, actorId, target } = notification;

  if (type === "follow") {
    return actorId?.username ? `/(public)/${actorId.username}` : null;
  }

  if (
    (type === "like" || type === "comment" || type === "share") &&
    target?.postId
  ) {
    return `/post/${target.postId}`;
  }

  return null;
};

const NotificationCard = ({ item, onRead, onDelete }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();

  // ---------- animations ----------
  const enterOpacity = useRef(new Animated.Value(0)).current; // fade-in
  const exitOpacity = useRef(new Animated.Value(1)).current; // delete-এর সময়
  const exitX = useRef(new Animated.Value(0)).current;
  const unreadBg = useRef(new Animated.Value(item.read ? 0 : 1)).current;
  const deleting = useRef(false);

  // প্রথমবার দেখা দিলে হালকা fade-in
  useEffect(() => {
    Animated.timing(enterOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [enterOpacity]);

  // read হলে unread-এর ব্যাকগ্রাউন্ড ধীরে ধীরে মিলিয়ে যাবে
  useEffect(() => {
    Animated.timing(unreadBg, {
      toValue: item.read ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [item.read, unreadBg]);

  const handlePress = () => {
    // আগে থেকে read হলে অকারণে request পাঠাবো না
    if (!item.read) onRead(item._id);

    const path = getNavigationPath(item);
    if (path) router.push(path as any);
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

  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(enterOpacity, exitOpacity),
        transform: [{ translateX: exitX }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        className="flex-row items-start px-4 py-3.5 gap-3"
      >
        {/* unread background (animated) */}
        <Animated.View
          pointerEvents="none"
          className="bg-accent/10"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: unreadBg,
          }}
        />

        {/* avatar */}
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

        {/* content */}
        <View className="flex-1">
          <View className="text-text dark:text-dark-text">
            <View className="flex-row items-center gap-1">
              <Text className="font-semibold text-sm text-text dark:text-dark-text">
                {item.actorId?.name}
              </Text>
              <GreenMark
                mark={item.actorId?.greenmarkVerified || false}
                size={16}
              />
            </View>
            <Text className="text-text dark:text-dark-text">
              {getText(item.type, t)}
            </Text>
          </View>

          <Text className="text-xs font-medium text-text-tertiary dark:text-dark-text-tertiary mt-1">
            {timeAgo(item.createdAt)}
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
