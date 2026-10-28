import { SavedCollectionPanel } from "@/components/ui/save/SavedCollectionPanel";
import { SavedPostsList } from "@/components/ui/save/SavedPostsList";
import { useGetDefaultCollectionQuery } from "@/redux/api/save/savedCollectionApi";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  const { t } = useTranslation();

  const { data: defaultCol, isLoading: isDefaultColLoading } =
    useGetDefaultCollectionQuery();
  const [activeCollectionId, setActiveCollectionId] = useState<string>("");

  const resolvedId = activeCollectionId || defaultCol?._id || "";

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
        {/* কালেকশন প্যানেল — সবসময় উপরে */}
        <SavedCollectionPanel
          activeId={resolvedId}
          onSelect={(id) => setActiveCollectionId(id)}
        />

        {isDefaultColLoading ? (
          <View className="items-center py-16">
            <View className="w-full h-32 rounded-2xl bg-background dark:bg-dark-background mb-3" />
            <View className="w-full h-32 rounded-2xl bg-background dark:bg-dark-background mb-3" />
            <View className="w-full h-32 rounded-2xl bg-background dark:bg-dark-background" />
          </View>
        ) : resolvedId ? (
          // key দেওয়ায় কালেকশন বদলালে লিস্ট নতুন করে শুরু হয়,
          // আগের কালেকশনের পোস্ট ক্ষণিকের জন্য দেখা যায় না
          <SavedPostsList key={resolvedId} collectionId={resolvedId} />
        ) : (
          <View className="items-center justify-center py-16">
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
              {t("saveData.selectCollection")}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
