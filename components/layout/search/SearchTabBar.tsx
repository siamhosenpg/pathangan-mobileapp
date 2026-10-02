import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export type SearchTab = "all" | "accounts" | "posts" | "handouts";

interface Props {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
}

const TABS: { id: SearchTab; labelKey: string }[] = [
  { id: "all", labelKey: "searchData.tabAll" },
  { id: "accounts", labelKey: "searchData.tabAccounts" },
  { id: "posts", labelKey: "searchData.tabPosts" },
  { id: "handouts", labelKey: "searchData.tabHandouts" },
];

export default function SearchTabBar({ activeTab, onTabChange }: Props) {
  const { t } = useTranslation();

  return (
    <View className="bg-background dark:bg-dark-background border-b border-background-secondary dark:border-dark-border">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
              className={`px-3 py-3.5 border-b-2 ${
                isActive ? "border-accent" : "border-transparent"
              }`}
            >
              <Text
                className={`text-[13px] ${
                  isActive
                    ? "font-bold text-accent"
                    : "font-medium text-text-tertiary dark:text-dark-text-tertiary"
                }`}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
