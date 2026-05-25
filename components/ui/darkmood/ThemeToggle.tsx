import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export function ThemeToggle() {
  const { isDark, toggleTheme, setSystem } = useTheme();

  return (
    <View className="bg-background dark:bg-dark-background rounded-3xl overflow-hidden border border-border dark:border-dark-border mx-1">
      {/* System Mode */}
      <TouchableOpacity
        onPress={setSystem}
        activeOpacity={0.8}
        className="flex-row items-center justify-between px-5 py-5 border-b border-border dark:border-dark-border"
      >
        <View className="flex-row items-center gap-4">
          <View className="w-11 h-11 rounded-2xl items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <Ionicons name="phone-portrait-outline" size={22} color="#7a7a7a" />
          </View>

          <View>
            <Text className="text-base font-semibold text-text dark:text-dark-text">
              সিস্টেম অনুযায়ী
            </Text>

            <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              ডিভাইসের থিম ব্যবহার হবে
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? "#9ca3af" : "#6b7280"}
        />
      </TouchableOpacity>

      {/* Dark / Light Switch */}
      <View className="flex-row items-center justify-between px-5 py-5">
        <View className="flex-row items-center gap-4">
          <View className="w-11 h-11 rounded-2xl items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={22}
              color={isDark ? "#facc15" : "#f59e0b"}
            />
          </View>

          <View>
            <Text className="text-base font-semibold text-text dark:text-dark-text">
              {isDark ? "ডার্ক মোড" : "লাইট মোড"}
            </Text>

            <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              অ্যাপের থিম পরিবর্তন করুন
            </Text>
          </View>
        </View>

        {/* Apple Style Switch */}
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: "#d4d4d8",
            true: "#22c55e",
          }}
          thumbColor="#ffffff"
          ios_backgroundColor="#d4d4d8"
        />
      </View>
    </View>
  );
}
