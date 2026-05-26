import ProfileHeader from "@/components/ui/headers/ProfileHeader";
import ProfileAbout from "@/components/ui/profilepage/ProfileAbout";
import ProfilePosts from "@/components/ui/profilepage/ProfilePosts";
import ProfileTopSection from "@/components/ui/profilepage/ProfileTopSection";
import { useGetUserByUsernameQuery } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByUsernameQuery(username ?? "", { skip: !username });

  const currentUser = useAppSelector((state) => state.auth.user);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#00914d" />
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

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      {/* Header */}

      {currentUser?.id === user._id ? (
        <ProfileHeader
          mode="own"
          onEditPress={() => router.push("/editprofile" as any)}
        />
      ) : (
        <ProfileHeader mode="other" userId={user._id} name={user.name} />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <ProfileTopSection data={user} />
        {user.educations?.length || user.work?.length ? (
          <View className="h-2" />
        ) : null}
        <ProfileAbout
          educations={user.educations ?? []}
          work={user.work ?? []}
        />
        <View className="h-2" />
        <ProfilePosts userid={user._id} />
      </ScrollView>
    </View>
  );
}
