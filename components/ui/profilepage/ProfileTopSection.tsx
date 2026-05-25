import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
// import UserRating from "@/components/ui/star/UserRating"; // পরে uncomment করো
// import FollowStats from "./FollowStats"; // পরে uncomment করো
import type { User } from "@/types/userTypes";
import GreenMark from "../badges/GreenMark";
import UserRating from "../rating/UserRating";
import FollowStats from "./FollowStats";

interface Props {
  data: User;
}

const ProfileTopSection = ({ data }: Props) => {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnProfile = currentUser?.id === data._id;

  return (
    <View className="bg-background dark:bg-dark-background">
      {/* Cover Image */}
      <View className="w-full  p-4 ">
        {data.coverImage ? (
          <Image
            source={{ uri: data.coverImage }}
            className="w-full aspect-[6/2] rounded-lg border border-border dark:border-dark-border"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full aspect-[6/2] bg-accent/20 rounded-lg" />
        )}
      </View>

      {/* Profile Row */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-2 justify-start ">
          {/* Avatar */}
          <View className="w-20 h-20 rounded-full border border-border dark:border-dark-border overflow-hidden bg-accent/20">
            {data.profileImage ? (
              <Image
                source={{ uri: data.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-accent-secondary">
                <Text className="text-4xl font-bold text-accent uppercase mt-1">
                  {data.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name + Rating */}
          <View className="  ">
            <View className="flex-row items-center gap-1">
              <Text className="text-lg font-bold text-text dark:text-dark-text">
                {data.name}
              </Text>
              {data?.greenmarkVerified && (
                <GreenMark mark={!!data.greenmarkVerified} size={16} />
              )}
            </View>
            <View className="mt-0.5">
              <UserRating userId={data._id} />
            </View>
          </View>
        </View>

        {/* Follow Stats */}
        <View className="mt-4">
          <FollowStats activityStats={data.activityStats} />
        </View>

        {/* Bio + About */}
        {data.bio && (
          <Text className="mt-3 font-semibold text-base text-text dark:text-dark-text">
            {data.bio}
          </Text>
        )}
        {data.aboutText && (
          <Text className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary leading-5">
            {data.aboutText}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileTopSection;
