import HomeFeed from "@/components/layout/feed/HomeFeed";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card px-4 pt-12 pb-3 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-indigo-400">পাঠাঙ্গন</Text>
          <View className="flex-row gap-4">
            <Ionicons name="search-outline" size={24} color="#818CF8" />
            <Ionicons name="notifications-outline" size={24} color="#818CF8" />
          </View>
        </View>
      </View>

      {/* Feed */}
      <View className="flex-1 bg-background-secondary">
        <HomeFeed />
      </View>
    </View>
  );
}
