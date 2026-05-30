import {
  useFollowUserMutation,
  useGetFollowersQuery,
  useUnfollowUserMutation,
} from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  targetUserId: string;
}

const FollowButton = ({ targetUserId }: Props) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data, isLoading: checkingFollow } =
    useGetFollowersQuery(targetUserId);

  const followers = data?.followers ?? [];
  const isFollowing = followers.some((f: any) =>
    typeof f.followerId === "object"
      ? f.followerId._id === currentUser?.id
      : f.followerId === currentUser?.id,
  );

  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  const isLoading = checkingFollow || following || unfollowing;

  const handleToggle = async () => {
    if (!currentUser) return;
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId).unwrap();
      } else {
        await followUser(targetUserId).unwrap();
      }
    } catch (err) {
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
        style={{ color: isFollowing ? "#9CA3AF" : "#00914d" }}
      >
        {isLoading ? "..." : isFollowing ? "অনুসরণ করা হচ্ছে" : "অনুসরণ করুন"}
      </Text>
    </TouchableOpacity>
  );
};

export default FollowButton;
