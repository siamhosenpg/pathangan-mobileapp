import { Notification } from "@/types/notification/notificationTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
interface Props {
  item: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getText = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return "তোমার পোস্টে রিঅ্যাক্ট করেছে";
    case "comment":
      return "কমেন্ট করেছে তোমার পোস্টে";
    case "follow":
      return "তোমাকে ফলো করেছে";
    case "share":
      return "পোস্ট শেয়ার করেছে";
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

  // follow → profile
  if (type === "follow") {
    return actorId?.username ? `/(public)/${actorId.username}` : null;
  }

  // post related
  if (
    (type === "like" || type === "comment" || type === "share") &&
    target?.postId
  ) {
    return `/post/${target.postId}`;
  }

  return null;
};

const NotificationCard = ({ item, onRead, onDelete }: Props) => {
  const router = useRouter();
  const handlePress = () => {
    onRead(item._id);

    const path = getNavigationPath(item);

    if (path) {
      router.push(path as any);
    }
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-start px-4 py-3 gap-3 rounded-2xl mx-3 my-1 ${
        item.read ? "bg-transparent" : "bg-accent/15"
      }`}
    >
      {/* avatar */}
      <View className="w-10 h-10 rounded-full bg-accent/30 items-center justify-center overflow-hidden">
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
        <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
          <Text className="font-bold text-text dark:text-dark-text">
            {item.actorId.name}{" "}
          </Text>
          {getText(item.type)}
        </Text>

        <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-1">
          {timeAgo(item.createdAt)}
        </Text>
      </View>

      {/* delete */}
      <TouchableOpacity onPress={() => onDelete(item._id)} className="p-2">
        <Ionicons name="close" size={16} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default NotificationCard;
