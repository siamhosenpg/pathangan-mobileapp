import i18next from "i18next";

/**
 * RTK Query এর যেকোনো error কে user এর জন্য ভাষা অনুযায়ী message এ বদলায়।
 * প্রতিটা screen এ আলাদা করে লিখতে হবে না।
 *
 * ব্যবহার:
 *   catch (err) { Alert.alert(t("somethingWrong"), getErrorMessage(err)); }
 */
export const getErrorMessage = (err: any): string => {
  const status = err?.status;

  if (status === "FETCH_ERROR") return i18next.t("errorMessages.network");
  if (status === "TIMEOUT_ERROR") return i18next.t("errorMessages.timeout");
  if (status === "PARSING_ERROR") return i18next.t("errorMessages.parsing");
  if (status === 401) return i18next.t("errorMessages.unauthorized");
  if (status === 403) return i18next.t("errorMessages.forbidden");
  if (status === 404) return i18next.t("errorMessages.notFound");
  if (status === 429) return i18next.t("errorMessages.tooManyRequests");
  if (typeof status === "number" && status >= 500)
    return i18next.t("errorMessages.server");

  // backend যদি নিজে message পাঠায় (যেমন 400, 409)
  return err?.data?.message ?? i18next.t("errorMessages.generic");
};

/** Network/server সমস্যা কি না (retry button দেখানো উচিত কি না বুঝতে) */
export const isRetryableError = (err: any): boolean => {
  const status = err?.status;
  return (
    status === "FETCH_ERROR" ||
    status === "TIMEOUT_ERROR" ||
    (typeof status === "number" && status >= 500)
  );
};
