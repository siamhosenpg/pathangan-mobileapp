import {
  useGetFeedCategoriesQuery,
  useGetMyInterestsQuery,
  useResetMyInterestsMutation,
  useSetMyInterestsMutation,
} from "@/redux/api/feedApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// backend-এর onboardingMaxSelected-এর সাথে মিল
const MAX_SELECTED = 12;

const InterestSelect = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const lang = i18n.language?.startsWith("bn") ? "bn" : "en";

  const categoriesQuery = useGetFeedCategoriesQuery();
  const interestsQuery = useGetMyInterestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [saveInterests, { isLoading: saving }] = useSetMyInterestsMutation();
  const [resetInterests, { isLoading: resetting }] =
    useResetMyInterestsMutation();

  const [selected, setSelected] = useState<string[]>([]);
  const initializedRef = useRef(false);

  // সার্ভারের বাছা বিষয় একবারই state-এ নেওয়া
  useEffect(() => {
    if (initializedRef.current || !interestsQuery.data) return;
    initializedRef.current = true;
    setSelected(interestsQuery.data.selected);
  }, [interestsQuery.data]);

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      setSelected(selected.filter((s) => s !== slug));
      return;
    }
    if (selected.length >= MAX_SELECTED) {
      Alert.alert(t("feedData.maxReached", { max: MAX_SELECTED }));
      return;
    }
    setSelected([...selected, slug]);
  };

  const handleSave = async () => {
    if (selected.length < 1 || saving) return;

    try {
      await saveInterests({ categories: selected }).unwrap();
      router.back();
    } catch (err) {
      Alert.alert(t("feedData.error"), getErrorMessage(err));
    }
  };

  const handleReset = () => {
    Alert.alert(
      t("feedData.resetConfirmTitle"),
      t("feedData.resetConfirmMessage"),
      [
        { text: t("feedData.cancel"), style: "cancel" },
        {
          text: t("feedData.reset"),
          style: "destructive",
          onPress: async () => {
            try {
              await resetInterests().unwrap();
              setSelected([]);
            } catch (err) {
              Alert.alert(t("feedData.error"), getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const categories = categoriesQuery.data?.categories ?? [];
  const learned = interestsQuery.data?.top ?? [];

  let body;

  if (categoriesQuery.isLoading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  } else if (categoriesQuery.isError && categories.length === 0) {
    body = (
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
          {t("feedData.loadFailed")}
        </Text>
        <TouchableOpacity
          onPress={categoriesQuery.refetch}
          className="px-4 py-2 rounded-full border border-border dark:border-dark-border"
        >
          <Text className="font-semibold text-accent">
            {t("feedData.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    body = (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      >
        <Text className="text-sm leading-5 text-text-secondary dark:text-dark-text-secondary mb-4">
          {t("feedData.pickHint", { max: MAX_SELECTED })}
        </Text>

        {/* বিষয়ের তালিকা */}
        <View className="flex-row flex-wrap gap-2">
          {categories.map((c) => {
            const isSelected = selected.includes(c.slug);

            return (
              <TouchableOpacity
                key={c.slug}
                onPress={() => toggle(c.slug)}
                activeOpacity={0.75}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-accent border-accent"
                    : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? "text-white" : "text-text dark:text-dark-text"
                  }`}
                >
                  {c[lang]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ব্যবহার থেকে যা বোঝা গেছে (শুধু দেখার জন্য) */}
        <Text className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary tracking-widest uppercase mt-8 mb-2">
          {t("feedData.learnedTitle")}
        </Text>

        {learned.length === 0 ? (
          <Text className="text-sm leading-5 text-text-secondary dark:text-dark-text-secondary">
            {t("feedData.learnedEmpty")}
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {learned.map((item) => (
              <View
                key={item.category}
                className="px-3 py-1.5 rounded-full bg-accent/10"
              >
                <Text className="text-sm font-medium text-accent">
                  {item[lang]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* রিসেট */}
        <TouchableOpacity
          onPress={handleReset}
          disabled={resetting}
          activeOpacity={0.7}
          className="flex-row items-center gap-2 mt-8 self-start"
        >
          {resetting ? (
            <ActivityIndicator size="small" color="#f87171" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#f87171" />
          )}
          <Text className="text-sm font-semibold text-red-400">
            {t("feedData.reset")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const canSave = selected.length >= 1 && !saving;

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* ── Header ── */}
      <View className="flex-row items-center gap-3 px-5 pt-3 pb-3 border-b border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-text dark:text-dark-text">
          {t("feedData.pickTitle")}
        </Text>
      </View>

      <View className="flex-1">{body}</View>

      {/* ── নিচের বার: কয়টা বাছা হলো + সংরক্ষণ ── */}
      <View
        className="px-4 pt-3 border-t border-border dark:border-dark-border bg-background dark:bg-dark-background flex-row items-center justify-between"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
          {t("feedData.selectedCount", {
            count: selected.length,
            max: MAX_SELECTED,
          })}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
          className={`px-6 py-2.5 rounded-full ${
            canSave
              ? "bg-accent"
              : "bg-background-tertiary dark:bg-dark-background-tertiary"
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              className={`font-semibold ${
                canSave
                  ? "text-white"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {t("feedData.save")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InterestSelect;
