import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useTerms } from "@/constants/terms";

import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

// শুধু লেখাটুকু: gate আর read-only sheet দুই জায়গাতেই ব্যবহার হবে
export function TermsBody() {
  const { t } = useTranslation();
  const terms = useTerms();

  return (
    <View>
      <Text className="text-text-secondary dark:text-dark-text-secondary text-sm leading-6 mb-5">
        {terms.intro}
      </Text>

      {terms.sections.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="text-text dark:text-dark-text font-semibold text-sm mb-1.5">
            {section.title}
          </Text>
          <Text className="text-text-secondary dark:text-dark-text-secondary text-[13px] leading-6">
            {section.body}
          </Text>
        </View>
      ))}

      <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-1 mb-2">
        {t("authData.terms.lastUpdated", { date: terms.lastUpdated })}
      </Text>
    </View>
  );
}

// Register পেজে "শর্তাবলী" লিংকে চাপলে এটা খুলবে (বন্ধ করা যাবে)
export function TermsSheet() {
  const { t } = useTranslation();
  const { close } = useBottomSheet();

  return (
    <View className="px-5 pb-4">
      <Text className="text-text dark:text-dark-text text-lg font-semibold mb-4">
        {t("authData.terms.sheetTitle")}
      </Text>
      <TermsBody />
      <TouchableOpacity
        onPress={close}
        activeOpacity={0.8}
        className="h-12 rounded-xl bg-accent items-center justify-center mt-2"
      >
        <Text className="text-white font-semibold ">
          {t("authData.terms.understood")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
