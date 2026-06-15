// hooks/useTheme.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useCallback } from "react";

const THEME_KEY = "app_color_scheme";

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  const applyAndSave = useCallback(
    async (scheme: "light" | "dark" | "system") => {
      setColorScheme(scheme);
      await AsyncStorage.setItem(THEME_KEY, scheme);
    },
    [setColorScheme],
  );

  const toggleTheme = () => applyAndSave(isDark ? "light" : "dark");
  const setDark = () => applyAndSave("dark");
  const setLight = () => applyAndSave("light");
  const setSystem = () => applyAndSave("system");

  return { isDark, colorScheme, toggleTheme, setDark, setLight, setSystem };
}
