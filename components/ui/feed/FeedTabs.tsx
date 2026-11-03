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
    <View className="mx-4 mt-4 rounded-2xl   bg-background-secondary px-4  dark:bg-dark-background-secondary">
      <Text className=" pt-4 pb-1 text-[12px] font-semibold text-text-tertiary dark:text-dark-text-tertiary">
        That's some of the best content for you. You can also explore more
        content by switching between the tabs below.
      </Text>

      <View className="flex-row gap-3  py-3  ">
        {tabs.map((tab) => {
          const isActive = tab.key === active;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.8}
              className={` items-center justify-center rounded-full py-2 px-5 border ${
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
    </View>
  );
};

export default FeedTabs;
