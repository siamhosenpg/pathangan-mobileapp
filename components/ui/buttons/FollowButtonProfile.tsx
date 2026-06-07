import {
  useFollowUserMutation,
  useGetFollowersQuery,
  useUnfollowUserMutation,
} from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  targetUserId: string;
}

const FollowButtonProfile = ({ targetUserId }: Props) => {
  const { t } = useTranslation();

  const currentUser = useAppSelector((state) => state.auth.user);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data, isLoading: checkingFollow } =
    useGetFollowersQuery(targetUserId);

  const followers = data?.followers ?? [];

  // ✅ id এবং _id দুইটাই check
  const serverFollowing = followers.some((f: any) => {
    const followerId =
      typeof f.followerId === "object" ? f.followerId._id : f.followerId;
    return (
      followerId === currentUser?.id || followerId === (currentUser as any)?._id
    );
  });

  const [localFollowing, setLocalFollowing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocalFollowing(serverFollowing);
    setMounted(true);
  }, [serverFollowing]);

  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  const isLoading = checkingFollow || following || unfollowing;

  const handleToggle = async () => {
    if (!currentUser || isLoading) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic update
    setLocalFollowing((prev) => !prev);

    try {
      if (localFollowing) {
        await unfollowUser(targetUserId).unwrap();
      } else {
        await followUser(targetUserId).unwrap();
      }
    } catch (err) {
      // rollback
      setLocalFollowing((prev) => !prev);
      console.error("Follow toggle failed:", err);
    }
  };

  // নিজের profile-এ show করবে না
  if (currentUser?.id === targetUserId) return null;

  // server data আসার আগে hide
  if (!mounted) return null;

  // ✅ already follow করা থাকলে button দেখাবে না
  if (localFollowing) return null;

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border ${
        localFollowing
          ? "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
          : "bg-accent border-accent"
      }`}
    >
      <Ionicons
        name={localFollowing ? "person-remove-outline" : "person-add-outline"}
        size={16}
        color={localFollowing ? (isDark ? "#8a8a8a" : "#6b7280") : "#fff"}
      />
      <Text
        className={`text-sm font-semibold ${
          localFollowing
            ? "text-text-secondary dark:text-dark-text-secondary"
            : "text-white"
        }`}
      >
        {isLoading ? "..." : localFollowing ? t("unfollow") : t("follow")}
      </Text>
    </TouchableOpacity>
  );
};

export default FollowButtonProfile;
