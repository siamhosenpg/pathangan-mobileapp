import { useRecordViewMutation } from "@/redux/api/postApi";
import { toggleMute } from "@/redux/features/video/videoSlice";
import type { RootState } from "@/redux/store";
import { getVideoSource } from "@/utils/videoSource";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import VideoFullScreen from "./VideoFullScreen";

interface Props {
  uri: string;
  isVisible: boolean;
  isNearVisible?: boolean;
  videoMeta?: { width: number; height: number };
  postId: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_HEIGHT = 500;
const MIN_HEIGHT = SCREEN_WIDTH * 0.5;
const DEFAULT_HEIGHT = SCREEN_WIDTH * (9 / 16);

// কতক্ষণ চেপে ধরলে ২x শুরু হবে (ms)
const LONG_PRESS_DELAY = 250;

// লোড এতক্ষণের বেশি লাগলে তবেই loader দেখাবে (ঝলকানি আটকাতে)
const LOADER_SHOW_DELAY = 250;

const sessionViewedVideoPosts = new Set<string>();

// ── Streaming buffer সেটিং ──
// অল্প buffer জমলেই play শুরু হবে, বাকিটা চলতে চলতে নামবে
const BUFFER_OPTIONS = {
  // iOS + Android: সামনে কত সেকেন্ড আগে থেকে buffer রাখবে
  preferredForwardBufferDuration: 4,
  // iOS: বেশি buffer জমার অপেক্ষা না করে সাথে সাথে চালু
  waitsToMinimizeStalling: false,
  // Android: play শুরুর জন্য ন্যূনতম buffer (সেকেন্ড)
  minBufferForPlayback: 0.5,
};

// ───────────────────────── Loading overlay ─────────────────────────
const VideoLoader = ({
  visible,
  cover,
}: {
  visible: boolean;
  cover: boolean;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 200 : 180,
      delay: visible ? LOADER_SHOW_DELAY : 0,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          opacity,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: cover ? "#0b0b0b" : "transparent",
        },
      ]}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: cover ? 56 : 44,
            height: cover ? 56 : 44,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={cover ? "large" : "small"} color="#ffffff" />
        </View>
        {cover && (
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            ভিডিও লোড হচ্ছে
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

// ───────────────────────── Error overlay ─────────────────────────
const VideoError = ({ onRetry }: { onRetry: () => void }) => (
  <View
    style={[
      StyleSheet.absoluteFill,
      {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b0b0b",
        gap: 10,
      },
    ]}
  >
    <Ionicons name="alert-circle-outline" size={34} color="#ffffff99" />
    <Text
      style={{
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
        fontWeight: "600",
      }}
    >
      ভিডিও লোড হয়নি
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      }}
    >
      <Ionicons name="refresh" size={15} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
        আবার চেষ্টা
      </Text>
    </TouchableOpacity>
  </View>
);

const PostVideo = ({
  uri,
  isVisible,
  isNearVisible = false,
  videoMeta,
  postId,
}: Props) => {
  const dispatch = useDispatch();
  const isMuted = useSelector((state: RootState) => state.video.isMuted);
  const isAutoPlay = useSelector((state: RootState) => state.video.isAutoPlay);
  const appStateRef = useRef(AppState.currentState);

  const [is2x, setIs2x] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  const [status, setStatus] = useState<string>("idle");
  const [firstFrame, setFirstFrame] = useState(false);

  const playerRef = useRef<any>(null);
  const is2xActiveRef = useRef(false);
  const startTimeRef = useRef(0);

  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const isAutoPlayRef = useRef(isAutoPlay);
  isAutoPlayRef.current = isAutoPlay;
  const fullScreenRef = useRef(fullScreenVisible);
  fullScreenRef.current = fullScreenVisible;

  const [recordView] = useRecordViewMutation();
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isVisible && !sessionViewedVideoPosts.has(postId)) {
      viewTimerRef.current = setTimeout(() => {
        sessionViewedVideoPosts.add(postId);
        recordView(postId)
          .unwrap()
          .catch(() => {});
      }, 3000);
    } else {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    }
    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    };
  }, [isVisible, postId, recordView]);

  // স্ক্রিনে আসার আগেই (near) লোড শুরু হবে
  const shouldLoad = isVisible || isNearVisible;

  const videoHeight = useMemo(() => {
    if (videoMeta?.width && videoMeta?.height) {
      const aspectRatio = videoMeta.height / videoMeta.width;
      const calculated = SCREEN_WIDTH * aspectRatio;
      return Math.min(Math.max(calculated, MIN_HEIGHT), MAX_HEIGHT);
    }
    return DEFAULT_HEIGHT;
  }, [videoMeta?.width, videoMeta?.height]);

  // source memo করা, যাতে প্রতি render-এ player নতুন করে না বানায়
  // HLS (.m3u8) হলে contentType: "hls", পুরনো MP4 হলে useCaching
  const source = useMemo(
    () => (shouldLoad ? getVideoSource(uri) : null),
    [shouldLoad, uri],
  );

  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = isMuted;
    // streaming: অল্প buffer জমলেই play শুরু
    try {
      (p as any).bufferOptions = BUFFER_OPTIONS;
    } catch {}
  });
  playerRef.current = player;

  useEffect(() => {
    setFirstFrame(false);
    setStatus("loading");
  }, [uri]);

  // ── Status ট্র্যাক + Warm-up + error retry ──
  useEffect(() => {
    if (!shouldLoad) return;

    let warmed = false;
    let retried = false;
    let warmTimer: ReturnType<typeof setTimeout> | null = null;
    let frameFallback: ReturnType<typeof setTimeout> | null = null;

    const handleStatus = (next: string) => {
      setStatus(next);

      if (next === "readyToPlay") {
        if (!frameFallback) {
          frameFallback = setTimeout(() => setFirstFrame(true), 400);
        }

        if (warmed) return;
        warmed = true;

        if (isVisibleRef.current) return;

        try {
          player.muted = true;
          player.play();
          warmTimer = setTimeout(() => {
            try {
              if (!isVisibleRef.current) player.pause();
              player.muted = isMutedRef.current;
            } catch {}
          }, 100);
        } catch {}
        return;
      }

      if (next === "error" && !retried) {
        retried = true;
        try {
          const p: any = player;
          const retrySource = getVideoSource(uri);

          if (p.replaceAsync) p.replaceAsync(retrySource).catch(() => {});
          else p.replace(retrySource);
          if (
            isVisibleRef.current &&
            isAutoPlayRef.current &&
            !fullScreenRef.current
          ) {
            player.play();
          }
        } catch {}
      }
    };

    const sub = player.addListener("statusChange", ({ status: s }) =>
      handleStatus(s),
    );
    handleStatus(player.status);

    return () => {
      sub.remove();
      if (warmTimer) clearTimeout(warmTimer);
      if (frameFallback) clearTimeout(frameFallback);
    };
  }, [player, shouldLoad, uri]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  // ── Play / pause ──
  useEffect(() => {
    try {
      if (!isVisible || fullScreenVisible || !isAutoPlay) {
        player.pause();
      } else {
        player.play();
      }
    } catch {}
  }, [isVisible, isAutoPlay, fullScreenVisible, player]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      const p = playerRef.current;
      if (!p) return;

      try {
        if (prev === "active" && nextState !== "active") {
          p.pause();
        } else if (
          prev !== "active" &&
          nextState === "active" &&
          isVisibleRef.current &&
          isAutoPlayRef.current &&
          !fullScreenRef.current
        ) {
          p.play();
        }
      } catch {}
    });
    return () => subscription.remove();
  }, []);

  // ── Tap → full screen ──
  const openFullscreen = useCallback(() => {
    try {
      startTimeRef.current = playerRef.current?.currentTime ?? 0;
    } catch {
      startTimeRef.current = 0;
    }
    setFullScreenVisible(true);
  }, []);

  // ── চেপে ধরলে ২x ──
  const start2x = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    is2xActiveRef.current = true;
    try {
      p.playbackRate = 2;
    } catch {}
    setIs2x(true);
  }, []);

  const stop2x = useCallback(() => {
    if (!is2xActiveRef.current) return;
    is2xActiveRef.current = false;
    try {
      playerRef.current.playbackRate = 1;
    } catch {}
    setIs2x(false);
  }, []);

  // ── "আবার চেষ্টা" বাটন ──
  const handleRetry = useCallback(() => {
    setFirstFrame(false);
    setStatus("loading");
    try {
      const p: any = playerRef.current;
      const retrySource = getVideoSource(uri);

      if (p?.replaceAsync) p.replaceAsync(retrySource).catch(() => {});
      else p?.replace(retrySource);
      if (isVisibleRef.current && isAutoPlayRef.current) p?.play();
    } catch {}
  }, [uri]);

  if (!shouldLoad) {
    return (
      <View
        style={{ width: SCREEN_WIDTH, height: videoHeight }}
        className="bg-black items-center justify-center"
      >
        <Ionicons name="play-circle-outline" size={48} color="#ffffff40" />
      </View>
    );
  }

  const hasError = status === "error";
  const showCoverLoader = !firstFrame && !hasError;
  const showBufferLoader = firstFrame && status === "loading";

  return (
    <>
      <View
        style={{ width: SCREEN_WIDTH, height: videoHeight }}
        className="bg-black border-t border-b border-border dark:border-dark-border/50"
      >
        <VideoView
          player={player}
          style={{ width: SCREEN_WIDTH, height: videoHeight }}
          contentFit="cover"
          nativeControls={false}
          onFirstFrameRender={() => setFirstFrame(true)}
        />

        <Pressable
          onPress={openFullscreen}
          onLongPress={start2x}
          delayLongPress={LONG_PRESS_DELAY}
          onPressOut={stop2x}
          style={StyleSheet.absoluteFill}
        >
          {!isAutoPlay && firstFrame && (
            <View className="flex-1 items-center justify-center">
              <View className="bg-black/50 rounded-full w-16 h-16 items-center justify-center">
                <Ionicons name="play" size={32} color="#fff" />
              </View>
            </View>
          )}

          {is2x && (
            <View
              style={{ position: "absolute", top: 12, left: 0, right: 0 }}
              className="items-center"
            >
              <View className="bg-black/60 rounded-lg px-3 py-1 flex-row items-center gap-1">
                <Ionicons name="flash" size={14} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}
                >
                  ২× গতি
                </Text>
              </View>
            </View>
          )}
        </Pressable>

        <VideoLoader
          visible={showCoverLoader || showBufferLoader}
          cover={showCoverLoader}
        />

        {hasError && <VideoError onRetry={handleRetry} />}

        <TouchableOpacity
          onPress={() => dispatch(toggleMute())}
          className="absolute bottom-3 right-1 rounded-full p-2.5"
          activeOpacity={0.8}
        >
          <View className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
            <Ionicons
              name={isMuted ? "volume-off" : "volume-medium"}
              size={17}
              color="#fff"
            />
          </View>
        </TouchableOpacity>
      </View>

      <VideoFullScreen
        uri={uri}
        visible={fullScreenVisible}
        onClose={() => setFullScreenVisible(false)}
        videoMeta={videoMeta}
        startTime={startTimeRef.current}
      />
    </>
  );
};

export default memo(PostVideo);
