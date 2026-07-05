import type { Handout } from "@/types/handoutTypes";
import { toBanglaNumber } from "@/utils/toBanglaNumber";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../../badges/GreenMark";

const categoryLabels: Record<string, string> = {
  golpo: "গল্প",
  itihash: "ইতিহাস",
  dharmiyo: "ধর্মীয়",
  kobita: "কবিতা",
  ovizoggota: "অভিজ্ঞতা",
  onnanno: "অন্যান্য",
};

interface Props {
  handout: Handout;
}

const HandoutCard = ({ handout }: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const n = (num: number) => (isBn ? toBanglaNumber(num) : String(num));

  const handlePress = () => {
    // নোট: এখানে slug পাঠানো হচ্ছে, যদিও route param এর নাম handoutId
    router.push(`/handouts/${handout.slug}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      className="flex-row gap-3 px-4 rounded-2xl "
    >
      {/* কভার ইমেজ (বামে) */}
      <View className="w-24 aspect-[2/3] rounded-xl overflow-hidden bg-background-tertiary dark:bg-dark-background-tertiary">
        {handout.coverImage ? (
          <Image
            source={{ uri: handout.coverImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons
              name="book-outline"
              size={28}
              color={isDark ? "#4b5563" : "#9ca3af"}
            />
          </View>
        )}
      </View>

      {/* কনটেন্ট (ডানে) */}
      <View className="flex-1 justify-between py-0.5">
        <View className="gap-1.5">
          <Text
            numberOfLines={2}
            className="text-base font-bold text-text dark:text-dark-text leading-6"
          >
            {handout.title}
          </Text>

          <Text
            numberOfLines={2}
            className="text-sm text-text-secondary dark:text-dark-text-secondary leading-5"
          >
            {handout.description}
          </Text>

          {/* লেখক তথ্য */}
          <View className="flex-row items-center gap-2 mt-1">
            {handout.user?.profileImage ? (
              <Image
                source={{ uri: handout.user.profileImage }}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <View className="w-5 h-5 rounded-full bg-accent-transparent items-center justify-center">
                <Ionicons name="person" size={10} color="#00914d" />
              </View>
            )}
            <View className="items-center flex-row gap-1 flex-1">
              <Text
                numberOfLines={1}
                className="text-xs text-text-secondary dark:text-dark-text-secondary font-semibold flex-shrink"
              >
                {handout.user?.name ?? handout.user?.username}
              </Text>
              <GreenMark mark={handout.user?.greenmarkVerified} size={11} />
            </View>
          </View>
        </View>

        {/* স্ট্যাটস রো */}
        <View className="flex-row items-center gap-3 mt-2 pt-2 border-t border-border/50 dark:border-dark-border/50">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="reader-outline"
              size={12}
              color={isDark ? "#8a8a8a" : "#6d6d6d"}
            />
            <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
              {n(handout.chaptersCount)} অধ্যায়
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons
              name="time-outline"
              size={12}
              color={isDark ? "#8a8a8a" : "#6d6d6d"}
            />
            <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
              {n(handout.estimatedReadTime)} মিনিট
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons
              name="heart-outline"
              size={12}
              color={isDark ? "#8a8a8a" : "#6d6d6d"}
            />
            <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
              {n(handout.likesCount)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HandoutCard;
