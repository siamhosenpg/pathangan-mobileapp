import { PixelRatio } from "react-native";

// Cloudinary URL হলে ছোট সাইজের version বানায়, নইলে যেমন আছে তেমন ফেরত দেয়
export function getAvatarUrl(
  url: string | null | undefined,
  size: number,
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // ইতিমধ্যে transformation থাকলে আবার বসাবে না
  if (/\/upload\/(?:[a-z]_[^/,]+,?)+\//.test(url)) return url;

  // ফোনের ঘনত্ব অনুযায়ী পিক্সেল, ২৪ এর গুণিতকে গোল করা (cache hit বাড়ে)
  const px = Math.ceil((size * PixelRatio.get()) / 24) * 24;

  return url.replace(
    "/upload/",
    `/upload/w_${px},h_${px},c_fill,g_face,q_auto,f_auto/`,
  );
}
