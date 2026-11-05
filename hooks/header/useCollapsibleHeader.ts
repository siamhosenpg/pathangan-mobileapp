import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, type LayoutChangeEvent } from "react-native";

type ScrollHandler = (y: number) => void;

export function useCollapsibleHeader() {
  // Header (এবং থাকলে tabs) মিলিয়ে পুরো bar-এর উচ্চতা
  const [barH, setBarH] = useState(0);
  const barHRef = useRef(0);

  // 0 = পুরো দেখাচ্ছে, barH = পুরো লুকানো
  const offset = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(0);

  // প্রতিটা list-এর আলাদা শেষ y মনে রাখা হয়
  const lastY = useRef<Record<string, number>>({});
  const handlers = useRef<Record<string, ScrollHandler>>({});
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateTo = useCallback(
    (to: number) => {
      offset.stopAnimation();
      offsetRef.current = to;
      Animated.timing(offset, {
        toValue: to,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [offset],
  );

  // scroll থেমে গেলে bar হয় পুরো দেখাবে, নয় পুরো লুকাবে
  // এখন content নড়ে না, শুধু bar নড়ে, তাই লাফাবে না
  const scheduleSnap = useCallback(() => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const h = barHRef.current;
      if (h <= 0) return;
      const cur = offsetRef.current;
      if (cur <= 0 || cur >= h) return;
      animateTo(cur > h / 2 ? h : 0);
    }, 150);
  }, [animateTo]);

  useEffect(() => {
    return () => {
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, []);

  const handleScroll = useCallback(
    (key: string, y: number) => {
      const h = barHRef.current;
      const prev = lastY.current[key] ?? 0;
      const delta = y - prev;
      lastY.current[key] = y;
      if (h <= 0) return;

      // একদম উপরে (বা iOS bounce) হলে bar পুরো দেখাও
      if (y <= 0) {
        if (snapTimer.current) clearTimeout(snapTimer.current);
        if (offsetRef.current !== 0) {
          offset.stopAnimation();
          offsetRef.current = 0;
          offset.setValue(0);
        }
        return;
      }
      if (delta === 0) return;

      // আঙুলের সাথে সাথে bar নড়বে (0 থেকে h এর মধ্যে)
      const next = Math.min(h, Math.max(0, offsetRef.current + delta));
      if (next !== offsetRef.current) {
        offset.stopAnimation();
        offsetRef.current = next;
        offset.setValue(next);
      }
      scheduleSnap();
    },
    [offset, scheduleSnap],
  );

  // একই key-তে সবসময় একই function ফেরত দেয়, তাই re-render-এ list বদলায় না
  const getScrollHandler = useCallback(
    (key: string = "default"): ScrollHandler => {
      if (!handlers.current[key]) {
        handlers.current[key] = (y: number) => handleScroll(key, y);
      }
      return handlers.current[key];
    },
    [handleScroll],
  );

  // tab বদলালে বা অন্য কোথাও থেকে bar ফিরিয়ে আনতে
  const showBar = useCallback(() => {
    if (offsetRef.current !== 0) animateTo(0);
  }, [animateTo]);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h > 0 && h !== barHRef.current) {
      barHRef.current = h;
      setBarH(h);
    }
  }, []);

  // bar উপরে উঠবে
  const translate = useMemo(() => Animated.multiply(offset, -1), [offset]);

  return { barH, translate, onBarLayout, getScrollHandler, showBar };
}

export type CollapsibleHeaderState = ReturnType<typeof useCollapsibleHeader>;
