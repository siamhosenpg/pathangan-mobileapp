import { useRecordViewMutation } from "@/redux/api/postApi";
import { useCallback, useEffect, useRef } from "react";

// ── Session guard — video post আলাদা Set এ track ──
const sessionViewedVideoPosts = new Set<string>();

const useVideoViewTracker = (postId: string) => {
  const hasCountedRef = useRef(false);
  const [recordView] = useRecordViewMutation();

  // recordView কে ref এ রাখো — stale closure এড়াতে
  const recordViewRef = useRef(recordView);
  useEffect(() => {
    recordViewRef.current = recordView;
  }, [recordView]);

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

        // ref থেকে call — dependency loop নেই
        recordViewRef
          .current(postId)
          .unwrap()
          .catch(() => {});
      }
    },
    [postId], // ← শুধু postId, recordView নেই
  );

  return { onProgressUpdate };
};

export default useVideoViewTracker;
