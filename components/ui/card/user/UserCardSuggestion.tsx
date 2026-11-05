import { SuggestedUser } from "@/types/userTypes";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import ProfileImage from "../../avatar/ProfileImage";
import GreenMark from "../../badges/GreenMark";
import FollowButton from "../../buttons/FollowButton";

interface Props {
  user: SuggestedUser;
}

export default function UserCardSuggestion({ user }: Props) {
  const router = useRouter();
  const isDeletedUser = !user;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => router.push(`/${user.username}`)}
      className="flex-row bg-background dark:bg-dark-background items-center gap-3 px-4 py-4 border-b border-border/50 dark:border-dark-border/50"
    >
      <ProfileImage
        uri={user?.profileImage}
        name={user?.name}
        size={44}
        isDeleted={isDeletedUser}
        recyclingKey={user?._id}
      />

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <Text className=" font-semibold text-text dark:text-dark-text">
            {user.name}
          </Text>
          {user.greenmarkVerified && (
            <GreenMark mark={user.greenmarkVerified} size={14} />
          )}
        </View>
        {!user.bio && (
          <Text className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
            @{user.username}
          </Text>
        )}
        {user.bio ? (
          <Text
            className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-0.5"
            numberOfLines={1}
          >
            {user.bio}
          </Text>
        ) : null}
      </View>

      {/* Follow button — isFollowing initial state হিসেবে পাস করা হচ্ছে */}
      <FollowButton
        targetUserId={user._id}
        initialIsFollowing={user.isFollowing}
      />
    </TouchableOpacity>
  );
}
