import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export type FeedTabKey = "forYou" | "latest";

interface Props {
  active: FeedTabKey;
  onChange: (tab: FeedTabKey) => void;
}

const FeedTabs = ({ active, onChange }: Props) => {
  const { t } = useTranslation();

  const tabs: { key: FeedTabKey; label: string }[] = [
    { key: "forYou", label: t("feedData.forYou") },
    { key: "latest", label: t("feedData.latest") },
  ];

  return (
    // পুরো প্রস্থ জুড়ে হালকা line, প্রতিটা tab ঠিক ৫০%
    <View className="flex-row border-b border-border dark:border-dark-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            className={`flex-1 items-center justify-center py-3 border-b-2 ${
              isActive ? "border-accent" : "border-transparent"
            }`}
          >
            <Text
              className={`text-[14px] ${
                isActive
                  ? "font-bold text-text dark:text-dark-text"
                  : "font-semibold text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FeedTabs;
