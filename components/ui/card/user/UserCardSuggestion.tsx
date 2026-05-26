import { User } from "@/types/userTypes";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../../badges/GreenMark";
import FollowButton from "../../buttons/FollowButton";

interface Props {
  user: User;
}

export default function UserCardSuggestion({ user }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/${user.username}`)}
      className="flex-row bg-background dark:bg-dark-background items-center gap-3 px-4 py-4 rounded-xl"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        {user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-accent/10">
            <Text className="text-accent  font-semibold text-lg">
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <Text className=" font-semibold text-text dark:text-dark-text">
            {user.name}
          </Text>
          {user.greenmarkVerified && (
            <GreenMark mark={user.greenmarkVerified} />
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

      {/* Follow button */}
      <FollowButton targetUserId={user._id} />
    </TouchableOpacity>
  );
}
