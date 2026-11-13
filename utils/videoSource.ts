// ভিডিওর URL দেখে ঠিক করে কোন সেটিং লাগবে
// .m3u8 হলে HLS stream, আর কিছু হলে সাধারণ MP4
export const isHlsUrl = (uri: string) =>
  uri.split("?")[0].toLowerCase().endsWith(".m3u8");

export const getVideoSource = (uri: string) => {
  if (isHlsUrl(uri)) {
    // HLS: cache চলে না, তাই useCaching দেওয়া হয়নি
    return { uri, contentType: "hls" as const };
  }
  // পুরনো MP4: আগের মতোই cache
  return { uri, useCaching: true };
};
