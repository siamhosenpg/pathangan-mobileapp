import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export type PostType = "post" | "question" | "course";

interface Props {
  active: PostType;
  onChange: (t: PostType) => void;
  isDark: boolean;
  /** Kon kon tab dekhabe. Default: sob gulo */
  types?: PostType[];
}

const ACCENT = "#00914d";

const tabs: {
  type: PostType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: "post", labelKey: "tabPost", icon: "create-outline" },
  { type: "question", labelKey: "tabQuestion", icon: "help-circle-outline" },
  { type: "course", labelKey: "tabCourse", icon: "book-outline" },
];

const PostTypeSelector = ({
  active,
  onChange,
  isDark,
  types = ["post", "question", "course"],
}: Props) => {
  const { t } = useTranslation();
  const visibleTabs = tabs.filter((tab) => types.includes(tab.type));

  return (
    <View className="flex-row p-1 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary">
      {visibleTabs.map((tab) => {
        const isActive = active === tab.type;
        return (
          <TouchableOpacity
            key={tab.type}
            onPress={() => onChange(tab.type)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: isActive ? ACCENT : "transparent",
            }}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={isActive ? "#fff" : isDark ? "#9CA3AF" : "#6B7280"}
            />
            <Text
              className={` font-semibold ${
                isActive
                  ? "text-white"
                  : "text-text-secondary dark:text-dark-text-secondary"
              }`}
            >
              {t(`postData.${tab.labelKey}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PostTypeSelector;
