import { FONT_SETTING_KEY } from "@/constants/fonts";
import i18n from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type AppLang = "bn" | "en";
type FontState = { enabled: boolean; lang: AppLang | null };

function toLang(lng?: string): AppLang | null {
  if (!lng) return "bn"; // তোমার ডিফল্ট ভাষা
  if (lng.startsWith("en")) return "en";
  if (lng.startsWith("bn")) return "bn";
  return null; // অন্য ভাষা হলে ডিভাইস ডিফল্ট
}

let state: FontState = { enabled: true, lang: toLang(i18n.language) };
const listeners = new Set<() => void>();

function setState(patch: Partial<FontState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

i18n.on("languageChanged", (lng) => setState({ lang: toLang(lng) }));

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => state;

export function useFontState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function loadFontSetting() {
  try {
    const saved = await AsyncStorage.getItem(FONT_SETTING_KEY);
    if (saved === "0" || saved === "1") setState({ enabled: saved === "1" });
  } catch {}
}

export async function setCustomFontEnabled(value: boolean) {
  setState({ enabled: value });
  try {
    await AsyncStorage.setItem(FONT_SETTING_KEY, value ? "1" : "0");
  } catch {}
}
