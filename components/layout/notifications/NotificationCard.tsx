import GreenMark from "@/components/ui/badges/GreenMark";
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
      activeOpacity={0.9}
      className={`flex-row items-start px-4 py-3.5 gap-3    ${
        item.read ? "bg-transparent" : "bg-accent/10"
      }`}
    >
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
        <View className=" text-text dark:text-dark-text">
          <View className=" flex-row items-center gap-1">
            <Text className="font-bold text-text dark:text-dark-text">
              {item.actorId.name}
            </Text>
            <GreenMark
              mark={item.actorId.greenmarkVerified || false}
              size={16}
            />
          </View>
          <Text>{getText(item.type)}</Text>
        </View>

        <Text className="text-xs font-medium text-text-tertiary dark:text-dark-text-tertiary mt-1">
          {timeAgo(item.createdAt)}
        </Text>
      </View>

      {/* delete */}
      <TouchableOpacity
        onPress={() => onDelete(item._id)}
        className="p-1.5  border-border border rounded-full"
      >
        <Ionicons name="close" size={16} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default NotificationCard;
