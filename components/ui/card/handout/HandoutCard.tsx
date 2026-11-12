import type { Handout } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import OptimizedImage from "../../avatar/OptimizedImage";
import GreenMark from "../../badges/GreenMark";
import TextFont from "../../font/TextFont";

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
      <OptimizedImage
        uri={handout.coverImage}
        width={96}
        radius={16}
        aspectRatio={2 / 3}
        fallbackIcon="book-outline"
        recyclingKey={handout.slug}
      />

      {/* কনটেন্ট (ডানে) */}
      <View className="flex-1 justify-center gap-1.5 py-0.5">
        <View className="gap-1.5">
          <TextFont
            numberOfLines={1}
            className="text-base font-bold text-text dark:text-dark-text leading-6"
          >
            {handout.title}
          </TextFont>

          <TextFont
            numberOfLines={2}
            className="text-sm text-text dark:text-dark-text leading-5"
          >
            {handout.description}
          </TextFont>

          <TextFont className="text-[10px] font-bold text-text-tertiary dark:text-dark-text-tertiary">
            {t(`handoutData.categories.${handout.category}`, {
              defaultValue: handout.category,
            })}
          </TextFont>

          {/* লেখক তথ্য */}
          <View className="flex-row items-center gap-2 mt-1">
            <OptimizedImage
              uri={handout.user?.profileImage}
              width={20}
              circle
              gravity="face"
              fallbackIcon="person"
            />

            <View className="items-center flex-row gap-1 flex-1">
              <TextFont
                numberOfLines={1}
                className="text-xs text-text-secondary dark:text-dark-text-secondary font-bold flex-shrink"
              >
                {handout.user?.name ?? handout.user?.username}
              </TextFont>
              <GreenMark mark={handout.user?.greenmarkVerified} size={11} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HandoutCard;
