import { useFontSetting } from "@/hooks/useFontSetting";
import { Ionicons } from "@expo/vector-icons";
import { Switch, View } from "react-native";
import TextFont from "../font/TextFont";

export default function FontSetting() {
  const { customFontEnabled, setCustomFontEnabled } = useFontSetting();

  return (
    <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-xl border border-border dark:border-dark-border overflow-hidden">
      <View className="flex-row items-center gap-2.5 px-4 py-3 border-b border-border dark:border-dark-border">
        <View className="w-8 h-8 rounded-lg items-center justify-center">
          <Ionicons name="text-outline" size={17} color="#888" />
        </View>
        <TextFont className="text-sm font-medium text-text dark:text-dark-text">
          ফন্ট সেটিংস
        </TextFont>
      </View>

      <View className="flex-row items-center justify-between px-4 py-3.5 gap-4">
        <View className="flex-1">
          <TextFont className="text-sm font-medium text-text dark:text-dark-text">
            কাস্টম ফন্ট
          </TextFont>
          <TextFont
            className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5"
            numberOfLines={2}
          >
            বন্ধ করলে ডিভাইসের ডিফল্ট ফন্ট ব্যবহার হবে
          </TextFont>
        </View>

        <Switch
          value={customFontEnabled}
          onValueChange={setCustomFontEnabled}
          trackColor={{ false: "#767577", true: "#00914d" }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}
