import { useTranslation } from "react-i18next";
import { SUPPORT_EMAIL, termsBn } from "./bn";
import { termsEn } from "./en";
import type { TermsContent } from "./types";

export { SUPPORT_EMAIL };
export type { TermsContent };

// বর্তমান ভাষা অনুযায়ী Terms-এর লেখা দেয়, ভাষা বদলালে নিজে থেকেই বদলে যায়
export function useTerms(): TermsContent {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith("en") ? termsEn : termsBn;
}
