import { MenuDrawer } from "@/components/layout/menu/MenuDrawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import NotificationBadge from "@/components/layout/notifications/NotificationBadge";
import NotificationPanel from "@/components/layout/notifications/NotificationPanel";
import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import { useGetUnreadNotificationCountQuery } from "@/redux/api/notification/notificationApi";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const { open } = useBottomSheet();

  const { data } = useGetUnreadNotificationCountQuery();
  const unreadCount = data?.count ?? 0;

  return (
    <>
      <View className="bg-background dark:bg-dark-background  px-4 pt-14 pb-1 border-b border-border dark:border-dark-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-0.5">
            <View className="flex-row items-center  w-12 h-12 -ml-1">
              <Image
                source={require("../../../assets/images/favicon.png")}
                className="w-full object-cover h-full"
                resizeMode="contain"
              />
            </View>
            {title ? (
              <View className="">
                <Text className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {title}
                </Text>
              </View>
            ) : (
              <View className=" ">
                <Text className="text-xl font-bold text-text dark:text-dark-text">
                  পাঠাঙ্গান
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-4 items-center">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search" as any)}
            >
              <Ionicons name="search-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => open(<NotificationPanel />)}>
              <View style={{ position: "relative" }}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#6B7280"
                />

                <NotificationBadge count={unreadCount} />
              </View>
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
