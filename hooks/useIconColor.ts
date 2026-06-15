import { useColorScheme } from "nativewind";

export const useIconColor = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    primary: isDark ? "#f1f1f1" : "#1b1b1b",
    secondary: isDark ? "#c4c4c4" : "#3a3a3a",
    muted: isDark ? "#8a8a8a" : "#6d6d6d",
    accent: isDark ? "#22c55e" : "#009439",
    border: isDark ? "#2e2e2e" : "#e7e7e7",
  };
};
