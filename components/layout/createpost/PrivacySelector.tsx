import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type Privacy = "public" | "friends" | "private";

interface Props {
  value: Privacy;
  onChange: (v: Privacy) => void;
  isDark: boolean;
}

const options = [
  {
    value: "public" as const,
    labelKey: "privacyPublic",
    icon: "earth-outline" as const,
  },
  {
    value: "friends" as const,
    labelKey: "privacyFriends",
    icon: "people-outline" as const,
  },
  {
    value: "private" as const,
    labelKey: "privacyPrivate",
    icon: "lock-closed-outline" as const,
  },
];

const PrivacySelector = ({ value, onChange, isDark }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-text dark:text-dark-text text-sm font-semibold">
        {t("postData.privacyTitle")}
      </Text>
      <View className="flex-row gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
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
                {t(`postData.${opt.labelKey}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PrivacySelector;
