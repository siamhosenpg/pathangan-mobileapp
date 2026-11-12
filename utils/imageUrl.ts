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

export type ImageGravity = "auto" | "face";

// Cloudinary URL হলে নির্দিষ্ট width আর aspect ratio অনুযায়ী ছোট version বানায়,
// নইলে যেমন আছে তেমন ফেরত দেয়
export function getOptimizedUrl(
  url: string | null | undefined,
  width: number,
  aspectRatio: number = 1, // width / height
  gravity: ImageGravity = "auto",
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // ইতিমধ্যে transformation থাকলে আবার বসাবে না
  if (/\/upload\/(?:[a-z]_[^/,]+,?)+\//.test(url)) return url;

  // ফোনের ঘনত্ব অনুযায়ী width, ২৪ এর গুণিতকে গোল করা (cache hit বাড়ে)
  const w = Math.ceil((width * PixelRatio.get()) / 24) * 24;
  const h = Math.round(w / aspectRatio);

  return url.replace(
    "/upload/",
    `/upload/w_${w},h_${h},c_fill,g_${gravity},q_auto,f_auto/`,
  );
}

// Cloudinary URL হলে শুধু width অনুযায়ী ছোট করে, ratio ঠিক রাখে।
// ছবি ছোট হলে বড় করে না (c_limit)
export function getFitUrl(
  url: string | null | undefined,
  width: number,
  maxPx: number = 1600, // এর বেশি বড় ছবি চাইবে না
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // ইতিমধ্যে transformation থাকলে আবার বসাবে না
  if (/\/upload\/(?:[a-z]_[^/,]+,?)+\//.test(url)) return url;

  // ফোনের ঘনত্ব অনুযায়ী width, ২৪ এর গুণিতকে গোল করা (cache hit বাড়ে)
  const px = Math.min(Math.ceil((width * PixelRatio.get()) / 24) * 24, maxPx);

  return url.replace("/upload/", `/upload/w_${px},c_limit,q_auto,f_auto/`);
}
