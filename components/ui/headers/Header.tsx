import { MenuDrawer } from "@/components/layout/menu/MenuDrawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View className="bg-background dark:bg-dark-background  px-4 pt-14 pb-3 border-b border-border dark:border-dark-border">
        <View className="flex-row items-center justify-between">
          {title ? (
            <View className="flex-row items-center gap-2 h-10">
              <Text className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                {title}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2 w-32 h-10 -ml-1">
              <Image
                source={require("../../../assets/logo/pathangan.png")}
                className="w-full object-cover h-full"
                resizeMode="contain"
              />
            </View>
          )}

          <View className="flex-row gap-4 items-center">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search" as any)}
            >
              <Ionicons name="search-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/notifications" as any)}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
            {/* menu button */}
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              <Ionicons name="menu-outline" size={26} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* drawer */}
      <MenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
