import FollowIcon from "@/assets/icons/user-add.svg";
import { useFollowState } from "@/hooks/useFollowState";
import { useAppSelector } from "@/redux/hooks";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  targetUserId: string;
}

const FollowButtonProfile = ({ targetUserId }: Props) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);

  const { isFollowing, isReady, toggle } = useFollowState(targetUserId);

  const handleFollow = async () => {
    if (!currentUser) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await toggle(); // UI updates instantly, rolls back on failure
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Hide on own profile
  if (currentUser?.id === targetUserId) return null;

  // Hide until follow status is known
  if (!isReady) return null;

  // Already following: the button disappears (unfollow lives in the menu sheet)
  if (isFollowing) return null;

  return (
    <TouchableOpacity
      onPress={handleFollow}
      activeOpacity={0.7}
      className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border bg-accent border-accent"
    >
      <FollowIcon width={14} height={14} color="#fff" />
      <Text className="font-semibold text-white">{t("follow")}</Text>
    </TouchableOpacity>
  );
};

export default FollowButtonProfile;
