import { SavedCollectionPanel } from "@/components/layout/save/SavedCollectionPanel";
import { SavedPostsList } from "@/components/layout/save/SavedPostsList";
import { useGetDefaultCollectionQuery } from "@/redux/api/save/savedCollectionApi";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  const { data: defaultCol, isLoading: isDefaultColLoading } =
    useGetDefaultCollectionQuery();
  const [activeCollectionId, setActiveCollectionId] = useState<string>("");

  const resolvedId = activeCollectionId || defaultCol?._id || "";

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      <View className="flex-1 bg-background-secondary  dark:bg-dark-background-secondary">
        {/* Collection panel — সবসময় উপরে */}
        <SavedCollectionPanel
          activeId={resolvedId}
          onSelect={(id) => setActiveCollectionId(id)}
        />

        {/* Posts scroll */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="  pb-32 gap-2"
        >
          {isDefaultColLoading ? (
            <View className="items-center py-16">
              <View className="w-full h-32 rounded-2xl bg-background dark:bg-dark-background  mb-3" />
              <View className="w-full h-32 rounded-2xl bg-background dark:bg-dark-background mb-3" />
              <View className="w-full h-32 rounded-2xl bg-background dark:bg-dark-background" />
            </View>
          ) : resolvedId ? (
            <SavedPostsList collectionId={resolvedId} />
          ) : (
            <View className="items-center justify-center py-16">
              <Text className="text-text-tertiary text-sm">
                একটি ফোল্ডার সিলেক্ট করো
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
