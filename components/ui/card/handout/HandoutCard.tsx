import type { Handout } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../../badges/GreenMark";

interface Props {
  handout: Handout;
}

interface StatProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

const Stat = ({ icon, label, color }: StatProps) => (
  <View className="flex-row items-center gap-1">
    <Ionicons name={icon} size={13} color={color} />
    <Text className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary">
      {label}
    </Text>
  </View>
);

const HandoutCard = ({ handout }: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();

  const iconColor = isDark ? "#8a8a8a" : "#6d6d6d";

  const handlePress = () => {
    // নোট: এখানে slug পাঠানো হচ্ছে, যদিও route param এর নাম handoutId
    router.push(`/handouts/${handout.slug}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      className="flex-row gap-3.5 mx-4    "
    >
      {/* কভার ইমেজ (বামে) */}
      <View className="w-24 aspect-[2/3] rounded-2xl overflow-hidden bg-background-tertiary dark:bg-dark-background-tertiary">
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
      <View className="flex-1 justify-center gap-1.5 py-0.5">
        <View className="gap-1.5">
          <Text
            numberOfLines={1}
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

          <Text className="text-[10px] font-bold text-text-tertiary dark:text-dark-text-tertiary">
            {t(`handoutData.categories.${handout.category}`, {
              defaultValue: handout.category,
            })}
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
                className="text-xs text-text-secondary dark:text-dark-text-secondary font-bold flex-shrink"
              >
                {handout.user?.name ?? handout.user?.username}
              </Text>
              <GreenMark mark={handout.user?.greenmarkVerified} size={11} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HandoutCard;
