import AuthInitializer from "@/components/ui/AuthInitializer";
import { BottomSheetProvider } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { usePushNotification } from "@/hooks/notification/usePushNotification";
import { store } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "../global.css";
import "../i18n";

const THEME_KEY = "app_color_scheme";

function AppInit() {
  usePushNotification();
  return null;
}

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (cancelled) return;

      // user manually dark/light সেট করলে সেটাই, নাহলে system follow করবে
      setColorScheme(saved === "dark" || saved === "light" ? saved : "system");
    });

    return () => {
      cancelled = true;
    };
  }, []);

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
          </BottomSheetProvider>
        </GestureHandlerRootView>
      </Provider>
    </SafeAreaProvider>
  );
}
