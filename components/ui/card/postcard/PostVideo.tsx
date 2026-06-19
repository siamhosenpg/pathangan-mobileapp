import { useRecordViewMutation } from "@/redux/api/postApi";
import { toggleMute } from "@/redux/features/video/videoSlice";
import type { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

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

// ── Session guard — একই video session এ একবারই count ──
const sessionViewedVideoPosts = new Set<string>();

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

  const [isManuallyPlaying, setIsManuallyPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [is2x, setIs2x] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(0);
  const isSeekingRef = useRef(false);
  const playerRef = useRef<any>(null);
  const isManuallyPlayingRef = useRef(false);
  const is2xActiveRef = useRef(false);

  // ── View tracking — post এর মতোই 3 সেকেন্ড ──
  const [recordView] = useRecordViewMutation();
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // visible হলে timer শুরু
    if (isVisible && !sessionViewedVideoPosts.has(postId)) {
      viewTimerRef.current = setTimeout(() => {
        sessionViewedVideoPosts.add(postId);
        recordView(postId)
          .unwrap()
          .catch(() => {});
      }, 3000);
    } else {
      // visible না হলে timer cancel
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

  const shouldLoad = isVisible || isNearVisible;

  const videoHeight = (() => {
    if (videoMeta?.width && videoMeta?.height) {
      const aspectRatio = videoMeta.height / videoMeta.width;
      const calculated = SCREEN_WIDTH * aspectRatio;
      return Math.min(Math.max(calculated, MIN_HEIGHT), MAX_HEIGHT);
    }
    return DEFAULT_HEIGHT;
  })();

  const player = useVideoPlayer(shouldLoad ? uri : null, (p) => {
    p.loop = true;
    p.muted = isMuted;
  });

  // playerRef সবসময় latest player রাখো
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // time update — শুধু progress bar এর জন্য
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("timeUpdate", (payload) => {
      if (isSeekingRef.current) return;
      const dur = player.duration ?? 0;
      durationRef.current = dur;
      if (dur > 0) {
        setProgress(payload.currentTime / dur);
      }
    });
    return () => sub.remove();
  }, [player]);

  // mute sync
  useEffect(() => {
    if (!player) return;
    player.muted = isMuted;
  }, [isMuted, player]);

  // play/pause logic
  useEffect(() => {
    if (!player) return;
    if (!isVisible) {
      player.pause();
      setIsManuallyPlaying(false);
      isManuallyPlayingRef.current = false;
      return;
    }
    if (isAutoPlay) {
      player.play();
    } else {
      if (isManuallyPlaying) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isVisible, isAutoPlay, isManuallyPlaying, player]);

  // AppState
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const p = playerRef.current;
      if (!p) return;
      if (
        appStateRef.current === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        p.pause();
      }
      if (
        appStateRef.current !== "active" &&
        nextState === "active" &&
        isVisible
      ) {
        if (isAutoPlay || isManuallyPlayingRef.current) p.play();
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [isVisible, isAutoPlay]);

  // tap to play/pause
  const handleVideoTap = () => {
    if (is2xActiveRef.current) return;
    const p = playerRef.current;
    if (!p) return;
    if (isAutoPlay) {
      if (p.playing) {
        p.pause();
      } else {
        p.play();
      }
    } else {
      setIsManuallyPlaying((prev) => {
        const next = !prev;
        isManuallyPlayingRef.current = next;
        return next;
      });
    }
  };

  // long press → 2x speed
  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      const p = playerRef.current;
      if (!p) return;
      p.playbackRate = 2;
      setIs2x(true);
      is2xActiveRef.current = true;
    }, 400);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    const p = playerRef.current;
    if (is2xActiveRef.current && p) {
      p.playbackRate = 1;
      setIs2x(false);
      setTimeout(() => {
        is2xActiveRef.current = false;
      }, 50);
    }
  };

  // PanResponder
  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        isSeekingRef.current = true;
        const p = playerRef.current;
        if (!p || durationRef.current === 0) return;
        const ratio = Math.min(
          Math.max(e.nativeEvent.locationX / SCREEN_WIDTH, 0),
          1,
        );
        setProgress(ratio);
        p.currentTime = ratio * durationRef.current;
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        const p = playerRef.current;
        if (!p || durationRef.current === 0) return;
        const ratio = Math.min(
          Math.max(e.nativeEvent.locationX / SCREEN_WIDTH, 0),
          1,
        );
        setProgress(ratio);
        p.currentTime = ratio * durationRef.current;
      },
      onPanResponderRelease: () => {
        isSeekingRef.current = false;
      },
    }),
  ).current;

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

  const showPlayIcon = !isAutoPlay && !isManuallyPlaying;

  return (
    <View
      style={{ width: SCREEN_WIDTH, height: videoHeight }}
      className="bg-black border-t border-b border-border dark:border-dark-border/50"
    >
      <VideoView
        player={player}
        style={{ width: SCREEN_WIDTH, height: videoHeight }}
        contentFit="cover"
        nativeControls={false}
      />

      {/* tap + long press overlay */}
      <TouchableOpacity
        onPress={handleVideoTap}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {showPlayIcon && (
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
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>
                2× গতি
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* mute button */}
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

      {/* progress bar */}
      <View
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          right: 0,
          height: 18,
          justifyContent: "flex-end",
        }}
        {...progressPanResponder.panHandlers}
      >
        <View
          style={{
            width: SCREEN_WIDTH,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        >
          <View
            style={{
              height: 2,
              width: `${progress * 100}%`,
              backgroundColor: "#fff",
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default PostVideo;
