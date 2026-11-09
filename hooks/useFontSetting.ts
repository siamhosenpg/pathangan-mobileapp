import { setCustomFontEnabled, useFontState } from "@/utils/fontStore";

export function useFontSetting() {
  const { enabled } = useFontState();
  return { customFontEnabled: enabled, setCustomFontEnabled };
}
