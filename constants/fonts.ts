export const FONT_SETTING_KEY = "app_custom_font_enabled";

export const FONT_FILES = {
  "HindSiliguri-Regular": require("../assets/fonts/HindSiliguri-Regular.ttf"),
  "HindSiliguri-Medium": require("../assets/fonts/HindSiliguri-Medium.ttf"),
  "HindSiliguri-SemiBold": require("../assets/fonts/HindSiliguri-SemiBold.ttf"),
  "HindSiliguri-Bold": require("../assets/fonts/HindSiliguri-Bold.ttf"),
  "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
  "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
  "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
};

export type FontWeightKey = 400 | 500 | 600 | 700;

export const FONT_FAMILIES: Record<
  "bn" | "en",
  Record<FontWeightKey, string>
> = {
  bn: {
    400: "HindSiliguri-Regular",
    500: "HindSiliguri-Medium",
    600: "HindSiliguri-SemiBold",
    700: "HindSiliguri-Bold",
  },
  en: {
    400: "Inter-Regular",
    500: "Inter-Medium",
    600: "Inter-SemiBold",
    700: "Inter-Bold",
  },
};
