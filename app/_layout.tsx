import AuthInitializer from "@/components/ui/AuthInitializer";
import { store } from "@/redux/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "../global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="user/[username]" />
        <Stack.Screen name="post/[id]" />
      </Stack>
    </Provider>
  );
}
