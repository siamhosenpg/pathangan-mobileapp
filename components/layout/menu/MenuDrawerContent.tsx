import SaveIcon from "@/assets/icons/bookmark.svg";
import handouticon from "@/assets/icons/journal.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import LogoutIcon from "@/assets/icons/sign-out-alt.svg";
import GreenMark from "@/components/ui/badges/GreenMark";
import { useLogoutMutation } from "@/redux/api/authApi";
import { clearUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";
import { useDrawer } from "./DrawerContext";

interface MenuItem {
  icon: React.FC<SvgProps>;
  label: string;
  route?: string;
  onPress?: () => void;
}

export function MenuDrawerContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const { closeDrawer } = useDrawer();
  const insets = useSafeAreaInsets();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  const navigate = (route: string) => {
    closeDrawer();
    // DrawerLayout close animation শেষ হওয়ার পর navigate
    setTimeout(() => {
      router.push(route as any);
    }, 250);
  };

  const handleLogout = async () => {
    closeDrawer();
    setTimeout(async () => {
      try {
        await logout().unwrap();
      } catch {
        dispatch(clearUser());
      }
      router.replace("/(auth)/login");
    }, 300);
  };

  const menuItems: MenuItem[] = [
    {
      icon: SaveIcon,
      label: t("savedPosts"),
      route: "/(tabs)/saved",
    },

    {
      icon: SettingsIcon,
      label: t("settings"),
      route: "/(tabs)/settings",
    },
    {
      icon: handouticon,
      label: t("createHandout"),
      route: "/(pages)/handouts/create",
    },
  ];

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-background border-r border-border dark:border-dark-border"
      style={{ paddingTop: insets.top }}
    >
      {/* User profile card */}
      <View className="px-5 pt-4 pb-4  ">
        <TouchableOpacity
          className="flex-row gap-3 items-center px-4 py-3 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary"
          onPress={() => navigate("/(tabs)/profile")}
          activeOpacity={0.7}
        >
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-accent items-center justify-center">
              <Text className="text-white font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text
                className="text-text dark:text-dark-text font-semibold text-base"
                numberOfLines={1}
              >
                {user?.name ?? t("unknownUser")}
              </Text>
              <GreenMark mark={user?.greenmarkVerified || false} size={14} />
            </View>
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm mt-0.5">
              @{user?.username ?? "unknown"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu items */}
      <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
        <View className="py-3">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => {
                if (item.route) navigate(item.route);
                if (item.onPress) {
                  closeDrawer();
                  setTimeout(item.onPress, 250);
                }
              }}
              activeOpacity={0.65}
              className="flex-row items-center gap-3 px-5 py-4 "
            >
              <View className="  items-center justify-center">
                <item.icon width={22} height={22} color={iconColor} />
              </View>
              <Text className="text-text-secondary font-semibold dark:text-dark-text-secondary text-[15px]">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout */}
      <View
        className="border-t border-border dark:border-dark-border"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.65}
          className="flex-row items-center gap-4 px-5 py-4"
        >
          <View className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950 items-center justify-center">
            <LogoutIcon width={19} height={19} color="#ef4444" />
          </View>
          <Text className="text-red-500 dark:text-red-400 text-[15px]">
            {t("logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
