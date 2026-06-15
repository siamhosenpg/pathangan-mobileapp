import { useRecordViewMutation } from "@/redux/api/postApi";
import { useCallback, useRef } from "react";

// ── Session guard — video post আলাদা Set এ track ──
const sessionViewedVideoPosts = new Set<string>();

const useVideoViewTracker = (postId: string) => {
  // একবার count হলে আর হবে না — component re-render এ reset হবে না
  const hasCountedRef = useRef(false);
  const [recordView] = useRecordViewMutation();

  // ── expo-video এর onPlaybackStatusUpdate থেকে call করবে ──
  // currentTime: seconds এ এখন কতটুকু দেখেছে
  // duration: video এর মোট length seconds এ
  const onProgressUpdate = useCallback(
    (currentTime: number, duration: number) => {
      // Already counted হলে skip
      if (hasCountedRef.current || sessionViewedVideoPosts.has(postId)) return;

      // Duration এখনো load হয়নি বা 0
      if (!duration || duration <= 0) return;

      // ── Duration এর 10% দেখা হয়েছে কিনা ──
      const tenPercentThreshold = duration * 0.1;

      if (currentTime >= tenPercentThreshold) {
        hasCountedRef.current = true;
        sessionViewedVideoPosts.add(postId);

        recordView(postId)
          .unwrap()
          .catch(() => {}); // silently fail
      }
    },
    [postId, recordView],
  );

  return { onProgressUpdate };
};

export default useVideoViewTracker;
