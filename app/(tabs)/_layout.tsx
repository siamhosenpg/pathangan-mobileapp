// app/(tabs)/_layout.tsx
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useRef } from "react";
import { Dimensions } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DrawerContext } from "@/components/layout/menu/DrawerContext";
import { MenuDrawerContent } from "@/components/layout/menu/MenuDrawerContent";
import AuthGuard from "@/components/ui/guard/AuthGuard";
import { useTranslation } from "react-i18next";

import HomeBold from "../../assets/icons/house.svg";
import Home from "../../assets/icons/houselite.svg";
import CourseBold from "../../assets/icons/learning.svg";
import Course from "../../assets/icons/learninglite.svg";
import QuestionBold from "../../assets/icons/question.svg";
import Question from "../../assets/icons/questionlite.svg";
import {
  default as Search,
  default as SearchBold,
} from "../../assets/icons/search.svg";
import SheetBold from "../../assets/icons/sheet.svg";
import Sheet from "../../assets/icons/sheetlite.svg";
import PeopleBold from "../../assets/icons/users.svg";
import People from "../../assets/icons/userslite.svg";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const drawerRef = useRef<DrawerLayout>(null);

  const openDrawer = () => drawerRef.current?.openDrawer();
  const closeDrawer = () => drawerRef.current?.closeDrawer();

  const hapticTabButton = (props: any) => (
    <Pressable
      {...props}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPress?.(e);
      }}
    />
  );

  const renderDrawer = () => <MenuDrawerContent />;

  return (
    <DrawerContext.Provider value={{ drawerRef, openDrawer, closeDrawer }}>
      <AuthGuard>
        <StatusBar style={isDark ? "light" : "dark"} />
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={DRAWER_WIDTH}
          drawerPosition="left"
          drawerType="slide"
          overlayColor="rgba(0,0,0,0.0)"
          drawerBackgroundColor={isDark ? "#0f0f0f" : "#ffffff"}
          renderNavigationView={renderDrawer}
          onDrawerOpen={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        >
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
                height: 70 + insets.bottom,
                paddingBottom: insets.bottom,
                paddingHorizontal: 10,
              },
              tabBarItemStyle: {
                alignItems: "center",
                justifyContent: "center",
              },
              tabBarIconStyle: { marginTop: 8 },
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
                  const Icon = focused ? HomeBold : Home;
                  return <Icon width={24} height={24} color={color} />;
                },
              }}
            />
            <Tabs.Screen
              name="question"
              options={{
                tabBarButton: hapticTabButton,
                title: t("questions"),
                tabBarIcon: ({ color, focused }) => {
                  const Icon = focused ? QuestionBold : Question;
                  return <Icon width={24} height={24} color={color} />;
                },
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                tabBarButton: hapticTabButton,
                title: t("search"),
                tabBarIcon: ({ color, focused }) => {
                  const Icon = focused ? SearchBold : Search;
                  return <Icon width={24} height={24} color={color} />;
                },
              }}
            />
            <Tabs.Screen
              name="courses"
              options={{
                tabBarButton: hapticTabButton,
                title: t("courses"),
                tabBarIcon: ({ color, focused }) => {
                  const Icon = focused ? CourseBold : Course;
                  return <Icon width={24} height={24} color={color} />;
                },
              }}
            />

            <Tabs.Screen
              name="people"
              options={{
                tabBarButton: hapticTabButton,
                title: t("people"),
                tabBarIcon: ({ color, focused }) => {
                  const Icon = focused ? PeopleBold : People;
                  return <Icon width={24} height={24} color={color} />;
                },
              }}
            />
            <Tabs.Screen
              name="handouts/index"
              options={{
                tabBarButton: hapticTabButton,
                title: t("handouts"),
                tabBarIcon: ({ color, focused }) => {
                  const Icon = focused ? SheetBold : Sheet;
                  return <Icon width={24} height={24} color={color} />;
                },
              }}
            />
            <Tabs.Screen name="profile" options={{ href: null }} />
            <Tabs.Screen name="[username]" options={{ href: null }} />
            <Tabs.Screen name="create" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
            <Tabs.Screen name="saved" options={{ href: null }} />

            <Tabs.Screen name="handouts/create" options={{ href: null }} />
            <Tabs.Screen name="handouts/mine" options={{ href: null }} />
            <Tabs.Screen
              name="handouts/[handoutId]/index"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="handouts/[handoutId]/chapter/[chapterId]"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="handouts/manage/[handoutId]/index"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="handouts/manage/[handoutId]/add-chapter"
              options={{ href: null }}
            />
          </Tabs>
        </DrawerLayout>
      </AuthGuard>
    </DrawerContext.Provider>
  );
}
