import { useColorScheme } from "nativewind";

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  const setDark = () => setColorScheme("dark");
  const setLight = () => setColorScheme("light");
  const setSystem = () => setColorScheme("system");

  return { isDark, colorScheme, toggleTheme, setDark, setLight, setSystem };
}
