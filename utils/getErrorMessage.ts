/**
 * RTK Query এর যেকোনো error কে user এর জন্য বাংলা message এ বদলায়।
 * প্রতিটা screen এ আলাদা করে লিখতে হবে না।
 *
 * ব্যবহার:
 *   catch (err) { Alert.alert("সমস্যা হয়েছে", getErrorMessage(err)); }
 */
export const getErrorMessage = (err: any): string => {
  const status = err?.status;

  if (status === "FETCH_ERROR")
    return "ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করো।";
  if (status === "TIMEOUT_ERROR")
    return "সার্ভার সাড়া দিচ্ছে না, একটু পরে আবার চেষ্টা করো।";
  if (status === "PARSING_ERROR")
    return "সার্ভার থেকে অপ্রত্যাশিত উত্তর এসেছে, আবার চেষ্টা করো।";
  if (status === 401) return "সেশন শেষ হয়ে গেছে, আবার লগইন করো।";
  if (status === 403) return "এই কাজটি করার অনুমতি তোমার নেই।";
  if (status === 404) return "যা খুঁজছো তা পাওয়া যায়নি।";
  if (status === 429) return "অনেক বেশি চেষ্টা করা হয়েছে, একটু অপেক্ষা করো।";
  if (typeof status === "number" && status >= 500)
    return "সার্ভারে সমস্যা হয়েছে, একটু পরে চেষ্টা করো।";

  // backend যদি নিজে message পাঠায় (যেমন 400, 409)
  return err?.data?.message ?? "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করো।";
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
