import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import ProfileHeader from "@/components/ui/headers/ProfileHeader";
import ProfileHeaderSkeleton from "@/components/ui/headers/ProfileHeaderSkeleton";
import ProfileAbout from "@/components/ui/profilepage/ProfileAbout";
import ProfilePosts from "@/components/ui/profilepage/ProfilePosts";
import ProfileTopSection from "@/components/ui/profilepage/ProfileTopSection";
import ProfileTopSectionSkeleton from "@/components/ui/profilepage/ProfileTopSectionSkeleton";
import { useGetUserByUsernameQuery } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isFetching,
    isError,
  } = useGetUserByUsernameQuery(username ?? "", {
    skip: !username,
    refetchOnMountOrArgChange: true,
  });

  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnProfile = currentUser?.username === user?.username;

  if (isLoading || isFetching) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background">
        <ProfileHeaderSkeleton />
        <ProfileTopSectionSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <Text className="text-text-secondary text-sm dark:text-dark-text-secondary">
          ব্যবহারকারী পাওয়া যায়নি
        </Text>
      </View>
    );
  }

  // ProfilePosts এর ListHeaderComponent হিসেবে পাঠাবো
  // এতে ScrollView + FlatList nesting সমস্যা থাকবে না
  // আর FlatList নিজেই scroll করবে — onViewableItemsChanged কাজ করবে
  const profileHeader = (
    <View>
      <ProfileTopSection data={user} />
      {user.educations?.length || user.work?.length ? (
        <View className="h-1" />
      ) : null}
      <ProfileAbout
        educations={user.educations ?? []}
        work={user.work ?? []}
        user={user}
      />
      <View className="h-1" />
    </View>
  );

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      {isOwnProfile ? (
        <ProfileHeader
          mode="own"
          onEditPress={() => router.push("/profile/editprofile" as any)}
        />
      ) : (
        <ProfileHeader mode="other" userId={user._id} name={user.name} />
      )}

      <ProfilePosts userid={user._id} listHeader={profileHeader} />
    </View>
  );
}
