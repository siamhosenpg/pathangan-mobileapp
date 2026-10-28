// ব্যাকএন্ডের error code থেকে i18n key বের করে
const CODE_TO_KEY: Record<string, string> = {
  NAME_EXISTS: "saveData.nameExists",
  NAME_RESERVED: "saveData.nameReserved",
  NAME_EMPTY: "saveData.nameEmpty",
  NAME_TOO_LONG: "saveData.nameTooLong",
  DEFAULT_LOCKED: "saveData.defaultLocked",
  ALREADY_SAVED: "saveData.alreadySavedNotice",
};

export const getSaveErrorKey = (error: unknown, fallbackKey: string) => {
  const code = (error as { data?: { code?: string } } | undefined)?.data?.code;
  return (code && CODE_TO_KEY[code]) || fallbackKey;
};
