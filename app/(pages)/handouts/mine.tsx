import {
  useDeleteHandoutMutation,
  useGetMyHandoutsQuery,
  usePublishHandoutMutation,
} from "@/redux/api/handout/handoutApi";
import type { Handout } from "@/types/handoutTypes";
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

const FILTER_KEYS: FilterTab[] = ["all", "draft", "published"];

export default function MyHandoutsScreen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
      t("handoutData.publishTitle"),
      t("handoutData.publishMessage"),
      [
        { text: t("handoutData.cancel"), style: "cancel" },
        {
          text: t("handoutData.publishAction"),
          onPress: async () => {
            try {
              await publishHandout(id).unwrap();
            } catch {
              Alert.alert(
                t("handoutData.errorTitle"),
                t("handoutData.publishFailed"),
              );
            }
          },
        },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(t("handoutData.deleteTitle"), t("handoutData.deleteMessage"), [
      { text: t("handoutData.cancel"), style: "cancel" },
      {
        text: t("handoutData.deleteAction"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHandout(id).unwrap();
          } catch {
            Alert.alert(
              t("handoutData.errorTitle"),
              t("handoutData.deleteFailed"),
            );
          }
        },
      },
    ]);
  };

  const filterLabel = (key: FilterTab) =>
    key === "all" ? t("handoutData.all") : t(`handoutData.status.${key}`);

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* টপ বার */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          {t("handoutData.myHandouts")}
        </Text>
      </View>

      {/* ফিল্টার ট্যাব */}
      <View className="flex-row px-4 gap-2 pb-3">
        {FILTER_KEYS.map((key) => {
          const isActive = filter === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              activeOpacity={0.8}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-accent border-accent"
                  : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                {filterLabel(key)}
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
            {t("handoutData.loadFailed")}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="px-6 py-2.5 rounded-full bg-accent"
          >
            <Text className="text-white font-semibold text-sm">
              {t("handoutData.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && handouts.length === 0 && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <View className="w-20 h-20 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary">
            <Ionicons
              name="document-text-outline"
              size={36}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
          </View>
          <Text className="text-base text-center text-text-secondary dark:text-dark-text-secondary">
            {t("handoutData.emptyList")}
          </Text>
        </View>
      )}

      {!isLoading && !isError && handouts.length > 0 && (
        <FlatList
          data={handouts}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 40,
            paddingTop: 4,
          }}
          renderItem={({ item }) => (
            <View className="rounded-3xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/handouts/manage/${item._id}`)}
                className="flex-row"
              >
                <View className="w-24 h-28 bg-background-tertiary dark:bg-dark-background-tertiary">
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

                <View className="flex-1 p-3.5 justify-center gap-1.5">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2.5 py-0.5 rounded-full ${
                        item.status === "published"
                          ? "bg-accent-transparent"
                          : "bg-yellow-500/15"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          item.status === "published"
                            ? "text-accent"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {item.status === "published"
                          ? t("handoutData.status.published")
                          : t("handoutData.status.draft")}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
                      {t(`handoutData.categories.${item.category}`, {
                        defaultValue: item.category,
                      })}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={2}
                    className="text-sm font-bold text-text dark:text-dark-text leading-5"
                  >
                    {item.title}
                  </Text>

                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    {t("handoutData.chaptersAndReads", {
                      chapters: item.chaptersCount,
                      reads: item.readCount,
                    })}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* অ্যাকশন রো */}
              <View className="flex-row border-t border-border dark:border-dark-border">
                <TouchableOpacity
                  onPress={() => router.push(`/handouts/manage/${item._id}`)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
                >
                  <Ionicons
                    name="create-outline"
                    size={15}
                    color={isDark ? "#c4c4c4" : "#3a3a3a"}
                  />
                  <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
                    {t("handoutData.edit")}
                  </Text>
                </TouchableOpacity>

                {item.status === "draft" && (
                  <TouchableOpacity
                    onPress={() => handlePublish(item._id)}
                    disabled={isPublishing}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-3 border-l border-border dark:border-dark-border"
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={15}
                      color="#00914d"
                    />
                    <Text className="text-xs font-semibold text-accent">
                      {t("handoutData.publishShort")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-3 border-l border-border dark:border-dark-border"
                >
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  <Text className="text-xs font-semibold text-red-500">
                    {t("handoutData.delete")}
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
