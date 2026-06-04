import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform } from "react-native";

import bn from "../locales/bn/translation.json";
import en from "../locales/en/translation.json";

const initI18n = async () => {
  let savedLang = "bn";

  // ✅ Web static rendering-এ AsyncStorage চলে না, তাই skip করো
  if (Platform.OS !== "web") {
    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const stored = await AsyncStorage.getItem("appLanguage");
      if (stored) savedLang = stored;
    } catch {
      // silent
    }
  }

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      compatibilityJSON: "v3",
      resources: {
        bn: { translation: bn },
        en: { translation: en },
      },
      lng: savedLang,
      fallbackLng: "bn",
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

initI18n();

export default i18n;
