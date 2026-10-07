import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export type PostType = "post" | "question" | "course";

interface Props {
  active: PostType;
  onChange: (t: PostType) => void;
  /** Kon kon tab dekhabe. Default: sob gulo */
  types?: PostType[];
  /** পুরনো কল-সাইটের সাথে compatible রাখার জন্য, এখন আর লাগে না */
  isDark?: boolean;
}

const tabs: { type: PostType; labelKey: string }[] = [
  { type: "post", labelKey: "tabPost" },
  { type: "question", labelKey: "tabQuestion" },
  { type: "course", labelKey: "tabCourse" },
];

const PostTypeSelector = ({
  active,
  onChange,
  types = ["post", "question", "course"],
}: Props) => {
  const { t } = useTranslation();
  const visibleTabs = tabs.filter((tab) => types.includes(tab.type));

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row w-full border-b border-border dark:border-dark-border"
    >
      {visibleTabs.map((tab) => {
        const isActive = active === tab.type;

        return (
          <TouchableOpacity
            key={tab.type}
            onPress={() => onChange(tab.type)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className="flex-1 items-center justify-center pt-3.5 pb-4"
          >
            <Text
              numberOfLines={1}
              className={`text-base ${
                isActive
                  ? "font-bold text-text dark:text-dark-text"
                  : "font-semibold text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {t(`postData.${tab.labelKey}`)}
            </Text>

            {/* active indicator: পুরো tab-এর চওড়া জুড়ে */}
            {isActive && (
              <View className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-accent" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PostTypeSelector;
