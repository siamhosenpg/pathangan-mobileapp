import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const switchLang = async (lang: string) => {
    await AsyncStorage.setItem("appLanguage", lang);
    await i18n.changeLanguage(lang);
  };

  return (
    <View className="flex-row gap-2">
      {(["bn", "en"] as const).map((lang) => (
        <TouchableOpacity
          key={lang}
          onPress={() => switchLang(lang)}
          activeOpacity={0.7}
          className={`px-4 py-1 rounded-full border ${
            current === lang
              ? "bg-accent border-accent"
              : "bg-transparent border-border dark:border-dark-border"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              current === lang
                ? "text-white"
                : "text-text-tertiary dark:text-dark-text-tertiary"
            }`}
          >
            {lang === "bn" ? "বাংলা" : "EN"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
