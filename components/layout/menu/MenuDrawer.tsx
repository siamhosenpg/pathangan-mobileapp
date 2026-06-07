import GreenMark from "@/components/ui/badges/GreenMark";
import { useLogoutMutation } from "@/redux/api/authApi";
import { clearUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  onPress?: () => void;
}

export function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  const [modalVisible, setModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setModalVisible(true);
    slideAnim.setValue(DRAWER_WIDTH);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 24,
        stiffness: 200,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 270,
        easing: Easing.in(Easing.back(0.4)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      openDrawer();
    } else if (modalVisible) {
      closeDrawer();
    }
  }, [visible]);

  const handleLogout = async () => {
    closeDrawer();
    setTimeout(async () => {
      try {
        await logout().unwrap();
      } catch {
        // API fail করলেও local clear করো
        dispatch(clearUser());
      }
      router.replace("/(auth)/login");
    }, 300);
  };

  const menuItems: MenuItem[] = [
    {
      icon: "bookmark-outline",
      label: t("savedPosts"),
      route: "/(tabs)/saved",
    },
    {
      icon: "notifications-outline",
      label: t("notifications"),
      route: "/(tabs)/notifications",
    },
    {
      icon: "settings-outline",
      label: t("settings"),
      route: "/(tabs)/settings",
    },
    {
      icon: "shield-checkmark-outline",
      label: t("privacyPolicy"),
      route: "/others/privacy-policy",
    },
    {
      icon: "document-text-outline",
      label: t("termsAndConditions"),
      route: "/others/terms-and-conditions",
    },
    {
      icon: "chatbubble-ellipses-outline",
      label: t("helpSupport"),
      route: "/others/support",
    },
  ];

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Backdrop */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="absolute inset-0 bg-black/50 dark:bg-black/60"
        >
          <Pressable className="flex-1" onPress={closeDrawer} />
        </Animated.View>

        {/* Drawer Panel — শুধু এটাই slide করবে */}
        <Animated.View
          style={{
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
          }}
          className="absolute top-0 bottom-0 right-0 bg-background dark:bg-dark-background border-l border-border dark:border-dark-border"
        >
          {/* User Info */}
          <View className="px-5 pt-20 pb-5">
            <TouchableOpacity
              className=" flex-row gap-2 items-center  px-4 py-3 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary"
              onPress={() => {
                closeDrawer();
                setTimeout(() => {
                  if (user?.username) {
                    router.push(`/(tabs)/profile`);
                  }
                }, 280);
              }}
            >
              {/* Profile Image or Avatar */}
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-14 h-14 rounded-full "
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-accent items-center justify-center mb-3">
                  <Text className="text-white dark:text-dark-text font-bold text-xl">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}

              <View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-text dark:text-dark-text font-semibold text-base ">
                    {user?.name ?? t("unknownUser")}
                  </Text>
                  <GreenMark
                    mark={user?.greenmarkVerified || false}
                    size={14}
                  />
                </View>
                <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm mt-0.5">
                  @{user?.username ?? " unknown"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/*
          <View className="px-5  ">
            <ThemeToggle />
          </View>
            */}

          {/* Menu Items — কোনো animation নেই, static */}
          <View className="flex-1 py-4">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  closeDrawer();
                  setTimeout(() => {
                    if (item.route) router.push(item.route as any);
                    if (item.onPress) item.onPress();
                  }, 280);
                }}
                activeOpacity={0.65}
                className="flex-row items-center gap-4 px-5 py-4 active:bg-background-secondary dark:active:bg-dark-background-secondary"
              >
                <View className="w-9 h-9 rounded-xl bg-background-secondary dark:bg-dark-background-secondary items-center justify-center">
                  <Ionicons name={item.icon} size={18} color="#6d6d6d" />
                </View>
                <Text className="text-text-secondary dark:text-dark-text-secondary text-[15px]">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <View className="border-t border-border dark:border-dark-border pb-10">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.65}
              className="flex-row items-center gap-4 px-5 py-4 active:bg-background-secondary dark:active:bg-dark-background-secondary"
            >
              <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center">
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              </View>
              <Text className="text-red-500 dark:text-red-400 text-[15px]">
                {t("logout")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
