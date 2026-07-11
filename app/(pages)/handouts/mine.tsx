import {
  useDeleteHandoutMutation,
  useGetMyHandoutsQuery,
  usePublishHandoutMutation,
} from "@/redux/api/handout/handoutApi";
import type { Handout } from "@/types/handoutTypes";
import { toBanglaNumber } from "@/utils/toBanglaNumber";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterTab = "all" | "draft" | "published";

const categoryLabels: Record<string, string> = {
  golpo: "গল্প",
  itihash: "ইতিহাস",
  dharmiyo: "ধর্মীয়",
  kobita: "কবিতা",
  ovizoggota: "অভিজ্ঞতা",
  onnanno: "অন্যান্য",
};

export default function MyHandoutsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const n = (num: number) => (isBn ? toBanglaNumber(num) : String(num));

  const [filter, setFilter] = useState<FilterTab>("all");

  const { data, isLoading, isError, refetch } = useGetMyHandoutsQuery({
    status: filter === "all" ? undefined : filter,
  });

  const [publishHandout, { isLoading: isPublishing }] =
    usePublishHandoutMutation();
  const [deleteHandout] = useDeleteHandoutMutation();

  const handouts: Handout[] = data?.data ?? [];

  const handlePublish = (id: string) => {
    Alert.alert(
      "পাবলিশ করবেন?",
      "পাবলিশ করার পর এটি মূল ফিডে সবাই দেখতে পাবে",
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "পাবলিশ করুন",
          onPress: async () => {
            try {
              await publishHandout(id).unwrap();
            } catch {
              Alert.alert("সমস্যা হয়েছে", "পাবলিশ করা যায়নি");
            }
          },
        },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert("ডিলিট করবেন?", "এটি পরে পুনরুদ্ধার করা যাবে", [
      { text: "বাতিল", style: "cancel" },
      {
        text: "ডিলিট করুন",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHandout(id).unwrap();
          } catch {
            Alert.alert("সমস্যা হয়েছে", "ডিলিট করা যায়নি");
          }
        },
      },
    ]);
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "সব" },
    { key: "draft", label: "ড্রাফট" },
    { key: "published", label: "প্রকাশিত" },
  ];

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* টপ বার */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          আমার হ্যান্ডআউট
        </Text>
      </View>

      {/* ফিল্টার ট্যাব */}
      <View className="flex-row px-4 gap-2 pb-3">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-accent border-accent"
                  : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00914d" />
        </View>
      )}

      {!isLoading && isError && (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={isDark ? "#f87171" : "#ef4444"}
          />
          <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
            লোড করা যায়নি
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="px-6 py-2 rounded-full bg-accent"
          >
            <Text className="text-white font-semibold text-sm">
              আবার চেষ্টা করুন
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && handouts.length === 0 && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Ionicons
            name="document-text-outline"
            size={48}
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
          <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
            এই তালিকায় কিছু নেই
          </Text>
        </View>
      )}

      {!isLoading && !isError && handouts.length > 0 && (
        <FlatList
          data={handouts}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 40,
            paddingTop: 4,
          }}
          renderItem={({ item }) => (
            <View className="rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/handouts/manage/${item._id}`)}
                className="flex-row"
              >
                <View className="w-24 h-24 bg-background-tertiary dark:bg-dark-background-tertiary">
                  {item.coverImage ? (
                    <Image
                      source={{ uri: item.coverImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Ionicons
                        name="book-outline"
                        size={24}
                        color={isDark ? "#4b5563" : "#9ca3af"}
                      />
                    </View>
                  )}
                </View>

                <View className="flex-1 p-3 justify-center gap-1">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        item.status === "published"
                          ? "bg-accent-transparent"
                          : "bg-yellow-500/15"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-semibold ${
                          item.status === "published"
                            ? "text-accent"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {item.status === "published" ? "প্রকাশিত" : "ড্রাফট"}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-text-tertiary dark:text-dark-text-tertiary">
                      {categoryLabels[item.category] ?? item.category}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    className="text-sm font-bold text-text dark:text-dark-text"
                  >
                    {item.title}
                  </Text>

                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    {n(item.chaptersCount)} অধ্যায় · {n(item.readCount)} পঠিত
                  </Text>
                </View>
              </TouchableOpacity>

              {/* অ্যাকশন রো */}
              <View className="flex-row border-t border-border dark:border-dark-border">
                <TouchableOpacity
                  onPress={() => router.push(`/handouts/manage/${item._id}`)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5"
                >
                  <Ionicons
                    name="create-outline"
                    size={15}
                    color={isDark ? "#c4c4c4" : "#3a3a3a"}
                  />
                  <Text className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">
                    সম্পাদনা
                  </Text>
                </TouchableOpacity>

                {item.status === "draft" && (
                  <TouchableOpacity
                    onPress={() => handlePublish(item._id)}
                    disabled={isPublishing}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 border-l border-border dark:border-dark-border"
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={15}
                      color="#00914d"
                    />
                    <Text className="text-xs font-medium text-accent">
                      পাবলিশ
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 border-l border-border dark:border-dark-border"
                >
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  <Text className="text-xs font-medium text-red-500">
                    ডিলিট
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
