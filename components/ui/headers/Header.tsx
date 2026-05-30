import { MenuDrawer } from "@/components/layout/menu/MenuDrawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import NotificationBadge from "@/components/layout/notifications/NotificationBadge";
import NotificationPanel from "@/components/layout/notifications/NotificationPanel";
import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import { useGetUnreadNotificationCountQuery } from "@/redux/api/notification/notificationApi";
import { useAppSelector } from "@/redux/hooks";
import { useColorScheme } from "nativewind";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  const { open } = useBottomSheet();
  const user = useAppSelector((state) => state.auth.user);

  const { data } = useGetUnreadNotificationCountQuery();
  const unreadCount = data?.count ?? 0;

  return (
    <>
      <View className="bg-background dark:bg-dark-background px-4 pt-14 pb-1 border-b border-border dark:border-dark-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-0.5">
            <View className="flex-row items-center w-12 h-12 -ml-1">
              <Image
                source={require("../../../assets/images/favicon.png")}
                className="w-full object-cover h-full"
                resizeMode="contain"
              />
            </View>
            {title ? (
              <View>
                <Text className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {title}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-xl font-bold text-text dark:text-dark-text">
                  পাঠাঙ্গান
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-5 items-center">
            <TouchableOpacity onPress={() => open(<NotificationPanel />)}>
              <View style={{ position: "relative" }}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={iconColor}
                />
                <NotificationBadge count={unreadCount} />
              </View>
            </TouchableOpacity>

            {/* menu button — icon এর বদলে profile image */}
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              {user?.profileImage ? (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    overflow: "hidden",
                    borderWidth: 0.5,
                    borderColor: isDark ? "#f1f1f1" : "#1b1b1b",
                  }}
                >
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                // profile image না থাকলে নামের প্রথম অক্ষর দিয়ে avatar
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#00914d",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* drawer */}
      <MenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
