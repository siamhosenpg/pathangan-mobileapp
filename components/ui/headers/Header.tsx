import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import AddIcon from "@/assets/icons/add.svg";
import BellIcon from "@/assets/icons/bell.svg";
import { useDrawer } from "@/components/layout/menu/DrawerContext";
import NotificationBadge from "@/components/layout/notifications/NotificationBadge";
import NotificationPanel from "@/components/layout/notifications/NotificationPanel";
import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import { useGetUnreadNotificationCountQuery } from "@/redux/api/notification/notificationApi";
import { useAppSelector } from "@/redux/hooks";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const { openDrawer } = useDrawer(); // ← এটা যোগ করো
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  const { open } = useBottomSheet();
  const user = useAppSelector((state) => state.auth.user);

  const { data } = useGetUnreadNotificationCountQuery();
  const unreadCount = data?.count ?? 0;

  const handleCreatePost = () => {
    router.push("/create");
  };

  return (
    <>
      <View className="bg-background dark:bg-dark-background px-5 pt-4 pb-3  border-b border-border dark:border-dark-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 mr-3">
            {/* menu button — icon এর বদলে profile image */}
            <TouchableOpacity onPress={openDrawer}>
              {user?.profileImage ? (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    overflow: "hidden",
                    borderWidth: 0.5,
                    borderColor: isDark ? "#333" : "#ccc",
                  }}
                >
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
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
            {title ? (
              <View className="flex-shrink">
                <Text
                  className="text-lg font-bold text-gray-900 dark:text-dark-text "
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
              </View>
            ) : (
              <View className="flex-shrink">
                <Text
                  className="text-lg font-bold text-text dark:text-dark-text "
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user?.name}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-5 items-center">
            <TouchableOpacity onPress={handleCreatePost}>
              <View>
                <AddIcon width={22} height={22} color={iconColor} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => open(<NotificationPanel />)}>
              <View style={{ position: "relative" }}>
                <BellIcon width={22} height={22} color={iconColor} />
                <NotificationBadge count={unreadCount} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
