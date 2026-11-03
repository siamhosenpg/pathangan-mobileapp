import { useGetMyInterestsQuery } from "@/redux/api/feedApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

const DISMISS_KEY_PREFIX = "interest_prompt_dismissed:";

// আগ্রহ না থাকলে ফিডের মাথায় বিষয় বাছাইয়ের কার্ড। "এখন নয়" চাপলে আর আসে না
const InterestPromptCard = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id ?? (user as any)?._id;

  const { data } = useGetMyInterestsQuery(undefined, { skip: !userId });

  // null = এখনো ফোন থেকে পড়া হয়নি
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    AsyncStorage.getItem(`${DISMISS_KEY_PREFIX}${userId}`)
      .then((value) => {
        if (!cancelled) setDismissed(value === "1");
      })
      .catch(() => {
        if (!cancelled) setDismissed(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (userId) {
      AsyncStorage.setItem(`${DISMISS_KEY_PREFIX}${userId}`, "1").catch(
        () => {},
      );
    }
  }, [userId]);

  if (!userId || dismissed !== false || !data) return null;

  // আগ্রহ জমে গেছে বা user নিজে বেছেছে, আর কার্ড লাগবে না
  if (data.hasInterests || data.selected.length > 0) return null;

  return (
    <View className="mx-4 my-3 p-4 rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary">
      <View className="flex-row items-center gap-2">
        <Ionicons name="sparkles-outline" size={20} color="#00914d" />
        <Text className="flex-1 text-base font-semibold text-text dark:text-dark-text">
          {t("feedData.promptTitle")}
        </Text>
      </View>

      <Text className="mt-1.5 text-sm leading-5 text-text-secondary dark:text-dark-text-secondary">
        {t("feedData.promptSub")}
      </Text>

      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={() => router.push("/(pages)/interests/select" as any)}
          activeOpacity={0.8}
          className="px-4 py-2 rounded-full bg-accent"
        >
          <Text className="text-sm font-semibold text-white">
            {t("feedData.promptAction")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDismiss}
          activeOpacity={0.7}
          className="px-4 py-2 rounded-full border border-border dark:border-dark-border"
        >
          <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
            {t("feedData.promptLater")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InterestPromptCard;
