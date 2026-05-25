import AuthInitializer from "@/components/ui/AuthInitializer";
import { BottomSheetProvider } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { store } from "@/redux/store";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { Provider } from "react-redux";
import "../global.css";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    // ✅ App open হলে system theme ধরবে
    const scheme = Appearance.getColorScheme();
    setColorScheme(scheme ?? "light");

    // ✅ System theme change হলে automatically আপডেট হবে
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme ?? "light");
    });

    return () => sub.remove();
  }, []);
  return (
    <Provider store={store}>
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
        </Stack>
      </BottomSheetProvider>
    </Provider>
  );
}
