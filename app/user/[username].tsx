import ProfileAbout from "@/components/ui/profilepage/ProfileAbout";
import ProfilePosts from "@/components/ui/profilepage/ProfilePosts";
import ProfileTopSection from "@/components/ui/profilepage/ProfileTopSection";
import { useGetUserByUsernameQuery } from "@/redux/api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByUsernameQuery(username ?? "", { skip: !username });

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
      <View className="bg-background dark:bg-dark-background px-4 pt-12 pb-3 border-b border-border dark:border-dark-border flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={22} color="#3a3a3a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text dark:text-dark-text">
            {user.name}
          </Text>
        </View>
        <TouchableOpacity className="p-1">
          <Ionicons name="ellipsis-vertical" size={22} color="#3a3a3a" />
        </TouchableOpacity>
      </View>

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
