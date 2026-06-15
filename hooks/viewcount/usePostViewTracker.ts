import { useRecordViewMutation } from "@/redux/api/postApi";
import { useCallback, useRef } from "react";

const sessionViewedPosts = new Set<string>();

const usePostViewTracker = () => {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [recordView] = useRecordViewMutation();

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{
        item: { _id: string; content?: { type?: string } };
        isViewable: boolean;
        index: number | null;
      }>;
    }) => {
      // ── currently visible post IDs ──
      const visibleIds = new Set(
        viewableItems.filter((v) => v.isViewable).map((v) => v.item._id),
      );

      // ── screen থেকে চলে যাওয়া posts এর timer cancel ──
      // changed array এর উপর নির্ভর না করে
      // timer আছে কিন্তু visible না — cancel করো
      for (const postId of Object.keys(timers.current)) {
        if (!visibleIds.has(postId)) {
          clearTimeout(timers.current[postId]);
          delete timers.current[postId];
        }
      }

      // ── visible posts এ timer শুরু ──
      viewableItems
        .filter((item) => item.isViewable)
        .forEach((item) => {
          const postId = item.item._id;
          const contentType = item.item.content?.type;

          // video skip — আলাদা hook handle করে
          if (contentType === "video") return;

          // session এ already counted
          if (sessionViewedPosts.has(postId)) return;

          // timer already চলছে
          if (timers.current[postId]) return;

          // ── 3 সেকেন্ড পর view record ──
          timers.current[postId] = setTimeout(() => {
            sessionViewedPosts.add(postId);
            recordView(postId)
              .unwrap()
              .catch(() => {});
            delete timers.current[postId];
          }, 3000);
        });
    },
    [recordView],
  );

  const clearAllTimers = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  return { onViewableItemsChanged, clearAllTimers };
};

export default usePostViewTracker;
