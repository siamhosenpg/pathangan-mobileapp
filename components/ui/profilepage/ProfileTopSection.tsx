import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
// import UserRating from "@/components/ui/star/UserRating"; // পরে uncomment করো
// import FollowStats from "./FollowStats"; // পরে uncomment করো
import type { User } from "@/types/userTypes";
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
    <View className="bg-background">
      {/* Cover Image */}
      <View className="w-full aspect-[6/2] bg-accent/20">
        {data.coverImage ? (
          <Image
            source={{ uri: data.coverImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-accent/20" />
        )}
      </View>

      {/* Profile Row */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-4 justify-start -mt-8">
          {/* Avatar */}
          <View className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-accent/20">
            {data.profileImage ? (
              <Image
                source={{ uri: data.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-accent-secondary">
                <Text className="text-3xl font-bold text-accent">
                  {data.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name + Rating */}
          <View className=" mt-6">
            <Text className="text-xl font-bold text-text">{data.name}</Text>
            <UserRating userId={data._id} />
          </View>
        </View>

        {/* Follow Stats */}
        <View className="mt-4">
          <FollowStats activityStats={data.activityStats} />
        </View>

        {/* Bio + About */}
        {data.bio && (
          <Text className="mt-3 font-semibold text-base text-text">
            {data.bio}
          </Text>
        )}
        {data.aboutText && (
          <Text className="mt-1 text-sm text-text-secondary leading-5">
            {data.aboutText}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileTopSection;
