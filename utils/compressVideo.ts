import { Video } from "react-native-compressor";

export async function compressVideo(
  uri: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  try {
    const compressedUri = await Video.compress(
      uri,
      {
        compressionMethod: "auto",
        maxSize: 1280, // max 720p
        bitrate: 1500000, // 1.5 Mbps
      },
      (progress) => {
        // progress = 0 থেকে 1
        onProgress?.(Math.round(progress * 100));
      },
    );

    return compressedUri;
  } catch (error) {
    console.error("Video compression failed:", error);
    throw error;
  }
}
