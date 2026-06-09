import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { Pressable } from "react-native-gesture-handler";

import AuthGuard from "@/components/ui/guard/AuthGuard";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const hapticTabButton = (props: any) => (
    <Pressable
      {...props}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        props.onPress?.(e);
      }}
    />
  );

  return (
    <AuthGuard>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#00914d",
          tabBarInactiveTintColor: isDark ? "#fff" : "#6d6d6",

          tabBarStyle: {
            backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2e2e2e" : "#e7e7e7",
            elevation: 0,
            shadowOpacity: 0,
            height: 84,
            paddingHorizontal: 6,
          },

          tabBarItemStyle: {
            alignItems: "center",
            justifyContent: "center",
          },

          tabBarIconStyle: {
            marginTop: 6,
          },

          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            marginBottom: 6,
          },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            tabBarButton: hapticTabButton,
            title: t("community"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="question"
          options={{
            tabBarButton: hapticTabButton,
            title: t("questions"),
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "head-question" : "head-question-outline"}
                size={focused ? 30 : 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarButton: hapticTabButton,
            title: t("search"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            tabBarButton: hapticTabButton,
            title: t("courses"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            tabBarButton: hapticTabButton,
            title: t("people"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="[username]" options={{ href: null }} />

        <Tabs.Screen name="create" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="saved" options={{ href: null }} />
      </Tabs>
    </AuthGuard>
  );
}
