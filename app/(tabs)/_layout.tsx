import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
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
          title: "কমিউনিটি",
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
          title: "প্রশ্নসমূহ",
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
          title: "তথ্য খুঁজুন",
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
        name="course"
        options={{
          title: "কোর্সসমূহ",
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
          title: "ব্যবহারকারী",
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
      // এখন
      <Tabs.Screen name="create" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
    </Tabs>
  );
}
