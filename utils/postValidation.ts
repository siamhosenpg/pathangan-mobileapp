export const TITLE_MIN = 10; // title + text দুটো থাকলে
export const TITLE_MAX = 120;
export const TITLE_ONLY_MIN = 50; // শুধু title থাকলে
export const TEXT_MIN = 50;
export const TEXT_MAX = 5000;
export const QUESTION_MIN = 50;

export type PostValidationError =
  | "errEmptyPost"
  | "errTitleTooLong"
  | "errTitleTooShort"
  | "errTitleOnlyTooShort"
  | "errTextTooShort"
  | "errTextTooLong"
  | "errEmptyQuestion"
  | "errQuestionTooShort";

// i18n-এ key না থাকলে এই বাংলা মেসেজ দেখাবে
export const POST_ERROR_FALLBACK: Record<PostValidationError, string> = {
  errEmptyPost:
    "শিরোনাম বা বিবরণ লিখতে হবে। শুধু ছবি/ভিডিও দিয়ে পোস্ট করা যাবে না",
  errTitleTooLong: `শিরোনাম সর্বোচ্চ ${TITLE_MAX} অক্ষরের হতে পারবে`,
  errTitleTooShort: `শিরোনাম কমপক্ষে ${TITLE_MIN} অক্ষরের হতে হবে`,
  errTitleOnlyTooShort: `শুধু শিরোনাম দিলে সেটা কমপক্ষে ${TITLE_ONLY_MIN} অক্ষরের হতে হবে, অথবা বিবরণও লিখুন`,
  errTextTooShort: `বিবরণ কমপক্ষে ${TEXT_MIN} অক্ষরের হতে হবে`,
  errTextTooLong: `বিবরণ সর্বোচ্চ ${TEXT_MAX} অক্ষরের হতে পারবে`,
  errEmptyQuestion: "প্রশ্ন লিখুন",
  errQuestionTooShort: `প্রশ্ন কমপক্ষে ${QUESTION_MIN} অক্ষরের হতে হবে`,
};

// মিডিয়া থাকুক বা না থাকুক, নিয়ম একই
export const validateNormalPost = ({
  title,
  text,
}: {
  title: string;
  text: string;
}): PostValidationError | null => {
  const t = title.trim();
  const x = text.trim();

  if (t.length > TITLE_MAX) return "errTitleTooLong";
  if (x.length > TEXT_MAX) return "errTextTooLong";

  // দুটোর কোনোটাই নেই
  if (!t && !x) return "errEmptyPost";

  // দুটোই আছে
  if (t && x) {
    if (t.length < TITLE_MIN) return "errTitleTooShort";
    if (x.length < TEXT_MIN) return "errTextTooShort";
    return null;
  }

  // শুধু text
  if (x) return x.length >= TEXT_MIN ? null : "errTextTooShort";

  // শুধু title
  return t.length >= TITLE_ONLY_MIN ? null : "errTitleOnlyTooShort";
};

export const validateQuestion = (
  questionText: string,
): PostValidationError | null => {
  const q = questionText.trim();
  if (!q) return "errEmptyQuestion";
  if (q.length < QUESTION_MIN) return "errQuestionTooShort";
  return null;
};
