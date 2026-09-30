import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import BackHeader from "@/components/ui/headers/BackHeader";
import ProfileHeaderSkeleton from "@/components/ui/headers/ProfileHeaderSkeleton";
import ProfileAbout from "@/components/ui/profilepage/ProfileAbout";
import ProfilePosts from "@/components/ui/profilepage/ProfilePosts";
import ProfileTopSection from "@/components/ui/profilepage/ProfileTopSection";
import ProfileTopSectionSkeleton from "@/components/ui/profilepage/ProfileTopSectionSkeleton";
import { useGetUserByUsernameQuery } from "@/redux/api/userApi";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  // currentData: only data for the current username (never stale data of another user)
  const {
    currentData: user,
    isLoading,
    isFetching,
    isError,
  } = useGetUserByUsernameQuery(username ?? "", {
    skip: !username,
    refetchOnMountOrArgChange: true,
  });

  // Skeleton only when there is nothing to show yet.
  // Background refetches (e.g. after follow) must not replace the page.
  const showSkeleton = isLoading || (!user && isFetching);

  if (showSkeleton) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background dark:bg-dark-background"
      >
        <ProfileHeaderSkeleton />
        <ProfileTopSectionSkeleton />
        <PostCardSkeleton />
      </SafeAreaView>
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

  // Passed as ListHeaderComponent of ProfilePosts:
  // avoids ScrollView + FlatList nesting, and FlatList scrolls by itself
  // so onViewableItemsChanged keeps working
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
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <BackHeader />
      <ProfilePosts userid={user._id} listHeader={profileHeader} />
    </SafeAreaView>
  );
}
