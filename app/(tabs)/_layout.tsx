import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { Pressable } from "react-native-gesture-handler";

import AuthGuard from "@/components/ui/guard/AuthGuard";
import { useTranslation } from "react-i18next";

import SearchBold from "../../assets/icons/category.svg";
import Search from "../../assets/icons/categorylite.svg";
import HomeBold from "../../assets/icons/house.svg";
import Home from "../../assets/icons/houselite.svg";
import CourseBold from "../../assets/icons/learning.svg";
import Course from "../../assets/icons/learninglite.svg";
import QuestionBold from "../../assets/icons/question.svg";
import Question from "../../assets/icons/questionlite.svg";
import PeopleBold from "../../assets/icons/users.svg";
import People from "../../assets/icons/userslite.svg";

import SheetBold from "../../assets/icons/sheet.svg";
import Sheet from "../../assets/icons/sheetlite.svg";

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
          tabBarActiveTintColor: isDark ? "#22c55e" : "#009439",
          tabBarInactiveTintColor: isDark ? "#fff" : "#222",

          tabBarStyle: {
            backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2e2e2e" : "#e7e7e7",
            elevation: 0,
            shadowOpacity: 0,
            height: 86,
            paddingHorizontal: 10,
          },

          tabBarItemStyle: {
            alignItems: "center",
            justifyContent: "center",
          },

          tabBarIconStyle: {
            marginTop: 8,
          },

          tabBarLabelStyle: {
            fontSize: 8,
            fontWeight: "600",
            marginBottom: 0,
            marginTop: 4,
            textTransform: "uppercase",
          },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            tabBarButton: hapticTabButton,
            title: t("community"),
            tabBarIcon: ({ color, focused }) => {
              const HomeIcon = focused ? HomeBold : Home;
              return <HomeIcon width={24} height={24} color={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="question"
          options={{
            tabBarButton: hapticTabButton,
            title: t("questions"),
            tabBarIcon: ({ color, focused }) => {
              const HomeIcon = focused ? QuestionBold : Question;
              return <HomeIcon width={24} height={24} color={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarButton: hapticTabButton,
            title: t("search"),
            tabBarIcon: ({ color, focused }) => {
              const HomeIcon = focused ? SearchBold : Search;
              return <HomeIcon width={24} height={24} color={color} />;
            },
          }}
        />

        <Tabs.Screen
          name="courses"
          options={{
            tabBarButton: hapticTabButton,
            title: t("courses"),
            tabBarIcon: ({ color, focused }) => {
              const HomeIcon = focused ? CourseBold : Course;
              return <HomeIcon width={24} height={24} color={color} />;
            },
          }}
        />

        <Tabs.Screen
          name="sheets"
          options={{
            tabBarButton: hapticTabButton,
            title: t("sheets"),
            tabBarIcon: ({ color, focused }) => {
              const HomeIcon = focused ? SheetBold : Sheet;
              return <HomeIcon width={24} height={24} color={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            tabBarButton: hapticTabButton,
            title: t("people"),
            tabBarIcon: ({ color, focused }) => {
              const HomeIcon = focused ? PeopleBold : People;
              return <HomeIcon width={24} height={24} color={color} />;
            },
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
