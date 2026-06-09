import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type PostType = "post" | "question" | "course";

interface Props {
  active: PostType;
  onChange: (t: PostType) => void;
  isDark: boolean;
}

const tabs: {
  type: PostType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: "post", label: "পোস্ট", icon: "create-outline" },
  { type: "question", label: "প্রশ্ন", icon: "help-circle-outline" },
  { type: "course", label: "কোর্স", icon: "book-outline" },
];

const PostTypeSelector = ({ active, onChange, isDark }: Props) => {
  return (
    <View className="flex-row gap-2 border border-border dark:border-dark-border rounded-2xl p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.type;
        return (
          <TouchableOpacity
            key={tab.type}
            onPress={() => onChange(tab.type)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl ${
              isActive ? "bg-accent" : ""
            }`}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={isActive ? "#fff" : isDark ? "#8a8a8a" : "#888"}
            />
            <Text
              className={`text-sm font-semibold ${
                isActive
                  ? "text-white"
                  : "text-text-secondary dark:text-dark-text-secondary"
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

export default PostTypeSelector;
