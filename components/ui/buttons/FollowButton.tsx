import {
  useFollowUserMutation,
  useGetFollowersQuery,
  useUnfollowUserMutation,
} from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  targetUserId: string;
}

const FollowButton = ({ targetUserId }: Props) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);

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

  useEffect(() => {
    setLocalFollowing(serverFollowing);
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

  if (currentUser?.id === targetUserId) return null;

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading}
      style={{ opacity: isLoading ? 0.6 : 1 }}
      activeOpacity={0.5}
    >
      <Text
        className="font-semibold text-sm"
        style={{ color: localFollowing ? "#9CA3AF" : "#00914d" }}
      >
        {isLoading ? "..." : localFollowing ? t("unfollow") : t("follow")}
      </Text>
    </TouchableOpacity>
  );
};

export default FollowButton;
