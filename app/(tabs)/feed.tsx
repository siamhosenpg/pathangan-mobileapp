import HomeFeed from "@/components/layout/feed/HomeFeed";

import { Header } from "@/components/ui/headers/Header";

import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedScreen() {
  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* Header */}
      <View>
        <Header />
      </View>

      {/* Feed */}
      <View className="flex-1 bg-background dark:bg-dark-background">
        <HomeFeed />
      </View>
    </SafeAreaView>
  );
}
