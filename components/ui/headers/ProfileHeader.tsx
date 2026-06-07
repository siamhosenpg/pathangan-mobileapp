import {
  useFollowUserMutation,
  useGetFollowersQuery,
  useUnfollowUserMutation,
} from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type OwnProfileProps = {
  mode: "own";
  onEditPress: () => void;
};

type OtherProfileProps = {
  mode: "other";
  userId: string;
  name: string;
};

type Props = OwnProfileProps | OtherProfileProps;

export default function ProfileHeader(props: Props) {
  const router = useRouter();

  if (props.mode === "own") {
    return (
      <View className="bg-background dark:bg-dark-background px-4 pt-16 pb-3 border-b border-border dark:border-dark-border flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text dark:text-dark-text">
          প্রোফাইল
        </Text>
        <TouchableOpacity
          onPress={props.onEditPress}
          className="flex-row items-center gap-1.5 bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-full px-3 py-1.5"
        >
          <Ionicons name="pencil-outline" size={14} color="#00914d" />
          <Text className="text-xs font-semibold text-text dark:text-dark-text">
            প্রোফাইল সম্পাদন
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <OtherProfileHeader
      userId={props.userId}
      name={props.name}
      router={router}
    />
  );
}

function OtherProfileHeader({
  userId,
  name,
  router,
}: {
  userId: string;
  name: string;
  router: ReturnType<typeof useRouter>;
}) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const { data, isLoading: checkingFollow } = useGetFollowersQuery(userId);
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  const isLoading = checkingFollow || following || unfollowing;

  const followers = data?.followers ?? [];
  const serverIsFollowing = followers.some((f: any) => {
    const followerId =
      typeof f.followerId === "object" ? f.followerId._id : f.followerId;
    // id এবং _id দুইটাই check করো
    return (
      followerId === currentUser?.id || followerId === (currentUser as any)?._id
    );
  });

  const [isFollowing, setIsFollowing] = useState(serverIsFollowing);

  useEffect(() => {
    setIsFollowing(serverIsFollowing);
  }, [serverIsFollowing]);

  const handleFollowPress = async () => {
    if (!currentUser || isLoading) return;

    setIsFollowing((prev) => !prev);

    try {
      if (isFollowing) {
        await unfollowUser(userId).unwrap();
      } else {
        await followUser(userId).unwrap();
      }
    } catch (err: any) {
      setIsFollowing((prev) => !prev);
      console.error("Follow error:", err?.data?.message ?? err);
    }
  };

  return (
    <View className="bg-background dark:bg-dark-background px-4 pt-16 pb-3 border-b border-border dark:border-dark-border flex-row items-center justify-between">
      {/* Left: Back + Name */}
      <View className="flex-row items-center gap-3 flex-1 mr-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#c4c4c4" : "#3a3a3a"}
          />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold text-text dark:text-dark-text"
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      {/* Right: Follow button */}
      <TouchableOpacity
        onPress={handleFollowPress}
        disabled={isLoading}
        className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border ${
          isFollowing
            ? "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
            : "bg-accent border-accent"
        }`}
      >
        <Ionicons
          name={isFollowing ? "person-remove-outline" : "person-add-outline"}
          size={14}
          color={isFollowing ? (isDark ? "#8a8a8a" : "#6b7280") : "#ffffff"}
        />
        <Text
          className={`text-xs font-semibold ${
            isFollowing
              ? "text-text-secondary dark:text-dark-text-secondary"
              : "text-white"
          }`}
        >
          {isLoading ? "..." : isFollowing ? t("unfollow") : t("follow")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
