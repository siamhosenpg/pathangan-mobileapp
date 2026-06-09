import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  value: "public" | "friends" | "private";
  onChange: (v: "public" | "friends" | "private") => void;
  isDark: boolean;
}

const options = [
  { value: "public" as const, label: "সবাই", icon: "earth-outline" as const },
  {
    value: "friends" as const,
    label: "বন্ধুরা",
    icon: "people-outline" as const,
  },
  {
    value: "private" as const,
    label: "শুধু আমি",
    icon: "lock-closed-outline" as const,
  },
];

const PrivacySelector = ({ value, onChange, isDark }: Props) => {
  return (
    <View className="gap-2">
      <Text className="text-text dark:text-dark-text text-sm font-semibold">
        কে দেখতে পাবে?
      </Text>
      <View className="flex-row gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                active
                  ? "bg-accent border-accent"
                  : "border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
              }`}
            >
              <Ionicons
                name={opt.icon}
                size={14}
                color={active ? "#fff" : isDark ? "#8a8a8a" : "#666"}
              />
              <Text
                className={`text-xs font-semibold ${
                  active
                    ? "text-white"
                    : "text-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PrivacySelector;
