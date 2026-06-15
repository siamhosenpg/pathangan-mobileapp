import AuthInitializer from "@/components/ui/AuthInitializer";
import { BottomSheetProvider } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { store } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import "../global.css";
import "../i18n";

const THEME_KEY = "app_color_scheme";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "dark" || saved === "light") {
        // ✅ User manually set করেছে — এটাই final, system ignore
        setColorScheme(saved);
      } else {
        // ✅ "system" বা কিছু save নেই — system theme follow করো
        const scheme = Appearance.getColorScheme();
        setColorScheme(scheme ?? "light");

        // system change listener শুধু "system" mode এ দরকার
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
          setColorScheme("light");
        });

        return () => sub.remove();
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetProvider>
          <AuthInitializer />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="user/[username]" />
            <Stack.Screen name="post/[id]" />
            <Stack.Screen name="answer/[answerId]" />
            <Stack.Screen name="course/[id]" />
            <Stack.Screen name="profile/editprofile" />
            <Stack.Screen name="private-questions" />
            <Stack.Screen name="private-questions/[id]" />
          </Stack>
        </BottomSheetProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
