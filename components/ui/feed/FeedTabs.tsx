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
    <View className="flex-row gap-3 px-4 py-2.5 bg-background dark:bg-dark-background border-b border-border dark:border-dark-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.8}
            className={`flex-1 items-center justify-center rounded-full py-2.5 border ${
              isActive
                ? "bg-accent border-accent"
                : "bg-transparent border-border dark:border-dark-border"
            }`}
          >
            <Text
              className={`text-[14px] font-semibold ${
                isActive
                  ? "text-white"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
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
