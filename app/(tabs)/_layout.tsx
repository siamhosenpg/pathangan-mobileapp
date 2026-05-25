import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image, Text, View } from "react-native";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const user = useAppSelector((state) => state.auth.user);

  const ProfileIcon = ({
    color,
    focused,
  }: {
    color: string;
    focused: boolean;
  }) => {
    if (user?.profileImage) {
      return (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            overflow: "hidden",
            borderWidth: focused ? 2 : 0,
            borderColor: "#00914d",
          }}
        >
          <Image
            source={{ uri: user.profileImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: focused ? "#00914d" : isDark ? "#2a2a2a" : "#e7e7e7",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: focused ? "#ffffff" : isDark ? "#8a8a8a" : "#6d6d6d",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </Text>
      </View>
    );
  };

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

      <Tabs.Screen name="create" options={{ href: null }} />

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

      <Tabs.Screen
        name="profile"
        options={{
          title: "প্রোফাইল",
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
    </Tabs>
  );
}
