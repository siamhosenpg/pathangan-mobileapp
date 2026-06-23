import { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FeedTab {
  key: string;
  label: string;
}

const FEED_TABS: FeedTab[] = [
  { key: "home", label: "Home" },
  { key: "following", label: "Following" },
  { key: "programming", label: "Programming" },
  { key: "health", label: "Health" },

  { key: "trending", label: "Trending" },
];

interface FeedTabsProps {
  onTabChange?: (key: string) => void;
}

const FeedTabs = ({ onTabChange }: FeedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<Record<string, { x: number; width: number }>>({});

  // কোনো ট্যাবে চাপ দিলে সেটাকে স্বয়ংক্রিয়ভাবে স্ক্রল করে দৃশ্যমান এলাকার মাঝামাঝি আনা
  const handleTabPress = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);

    const position = tabPositions.current[key];
    if (position && scrollRef.current) {
      const offset = Math.max(position.x - 16, 0);
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  const handleTabLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabPositions.current[key] = { x, width };
  };

  return (
    <View className="bg-background dark:bg-dark-background border-b border-border dark:border-dark-border">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {FEED_TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onLayout={handleTabLayout(tab.key)}
              onPress={() => handleTabPress(tab.key)}
              className={`px-4 py-2 rounded-full ${
                isActive
                  ? "bg-accent dark:bg-dark-accent"
                  : "bg-background-secondary dark:bg-dark-background-secondary"
              }`}
            >
              <Text
                className={`text-sm ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-text-secondary dark:text-dark-text-secondary font-medium"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FeedTabs;
