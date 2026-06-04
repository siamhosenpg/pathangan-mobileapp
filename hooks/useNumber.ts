import { useTranslation } from "react-i18next";

import { toBanglaNumber } from "../utils/toBanglaNumber";
export const useNumber = () => {
  const { i18n } = useTranslation();

  return (num: number): string => {
    return i18n.language === "bn" ? toBanglaNumber(num) : String(num);
  };
};
