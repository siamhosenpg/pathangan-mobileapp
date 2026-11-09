import "@/utils/patchText";

import NetworkBanner from "@/components/error/NetworkBanner";
import AuthInitializer from "@/components/ui/AuthInitializer";
import { BottomSheetProvider } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { FONT_FILES } from "@/constants/fonts";
import { usePushNotification } from "@/hooks/notification/usePushNotification";
import { store } from "@/redux/store";
import { loadFontSetting } from "@/utils/fontStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "../global.css";
import "../i18n";

SplashScreen.preventAutoHideAsync();

const THEME_KEY = "app_color_scheme";

function AppInit() {
  usePushNotification();
  return null;
}

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const [fontSettingReady, setFontSettingReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (cancelled) return;
      setColorScheme(saved === "dark" || saved === "light" ? saved : "system");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadFontSetting().finally(() => setFontSettingReady(true));
  }, []);

  const appReady = (fontsLoaded || !!fontError) && fontSettingReady;

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetProvider>
            <AuthInitializer />
            <AppInit />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(pages)" />
              <Stack.Screen name="user/[username]" />
            </Stack>
            <NetworkBanner />
          </BottomSheetProvider>
        </GestureHandlerRootView>
      </Provider>
    </SafeAreaProvider>
  );
}
