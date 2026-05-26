import ProfileHeader from "@/components/ui/headers/ProfileHeader";
import ProfileAbout from "@/components/ui/profilepage/ProfileAbout";
import ProfilePosts from "@/components/ui/profilepage/ProfilePosts";
import ProfileTopSection from "@/components/ui/profilepage/ProfileTopSection";
import { useGetUserByUsernameQuery } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByUsernameQuery(currentUser?.username ?? "", {
    skip: !currentUser?.username,
  });

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
        <Text className="text-text-secondary text-sm">
          প্রোফাইল লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      {/* Header */}
      <ProfileHeader
        mode="own"
        onEditPress={() => router.push("/profile/editprofile" as any)}
      />

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
