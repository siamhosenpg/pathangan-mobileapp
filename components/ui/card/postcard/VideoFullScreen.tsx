import type { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Modal,
  PanResponder,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import VideoControls from "./VideoControls";

interface Props {
  uri: string;
  visible: boolean;
  onClose: () => void;
  videoMeta?: { width: number; height: number };
  startTime?: number;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PADDING = 20;

const VideoFullScreen = ({ uri, visible, onClose, startTime = 0 }: Props) => {
  const isMuted = useSelector((state: RootState) => state.video.isMuted);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [is2x, setIs2x] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  const durationRef = useRef(0);
  const isSeekingRef = useRef(false);
  const playerRef = useRef<any>(null);
  const is2xActiveRef = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeAppliedRef = useRef(false);
  const isLandscapeRef = useRef(false);

  // landscape এ trackWidth = SCREEN_H - PADDING*2
  // portrait এ trackWidth = SCREEN_W - PADDING*2
  const getTrackWidth = () =>
    (isLandscapeRef.current ? SCREEN_H : SCREEN_W) - PADDING * 2;

  const player = useVideoPlayer(visible ? uri : null, (p) => {
    p.loop = true;
    p.muted = isMuted;
  });

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    if (!player) return;
    if (visible) {
      if (!startTimeAppliedRef.current && startTime > 0) {
        player.currentTime = startTime;
        startTimeAppliedRef.current = true;
      }
      player.play();
      setIsPlaying(true);
      resetControlsTimer();
    } else {
      player.pause();
      setIsPlaying(false);
      startTimeAppliedRef.current = false;
      setIsLandscape(false);
      isLandscapeRef.current = false;
    }
  }, [visible, player]);

  useEffect(() => {
    startTimeAppliedRef.current = false;
  }, [startTime]);

  useEffect(() => {
    if (!player) return;
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (!player || !visible) return;
    const interval = setInterval(() => {
      if (isSeekingRef.current) return;
      const dur = player.duration ?? 0;
      const cur = player.currentTime ?? 0;
      durationRef.current = dur;
      setDuration(dur);
      setCurrentTime(cur);
      if (dur > 0) setProgress(cur / dur);
    }, 250);
    return () => clearInterval(interval);
  }, [player, visible]);

  const resetControlsTimer = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500);
  };

  const handlePlayPause = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.playing) {
      p.pause();
      setIsPlaying(false);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      setShowControls(true);
    } else {
      p.play();
      setIsPlaying(true);
      resetControlsTimer();
    }
  };

  const handleVideoTap = () => {
    if (is2xActiveRef.current) return;
    if (showControls) {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      setShowControls(false);
    } else {
      resetControlsTimer();
    }
  };

  const handleSeekForward = () => {
    const p = playerRef.current;
    if (!p || durationRef.current === 0) return;
    p.currentTime = Math.min((p.currentTime ?? 0) + 10, durationRef.current);
    resetControlsTimer();
  };

  const handleSeekBackward = () => {
    const p = playerRef.current;
    if (!p) return;
    p.currentTime = Math.max((p.currentTime ?? 0) - 10, 0);
    resetControlsTimer();
  };

  const handleRotate = () => {
    const next = !isLandscapeRef.current;
    isLandscapeRef.current = next;
    setIsLandscape(next);
    resetControlsTimer();
  };

  const handleClose = () => {
    setIsLandscape(false);
    isLandscapeRef.current = false;
    onClose();
  };

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

  // ── PanResponder ──
  // Landscape এ touch এর X/Y axes swap হয়।
  // Rotated view এ আঙুল Y বরাবর সরালে locationX পাল্টায়।
  // তাই landscape এ locationY দিয়ে seek করতে হবে।
  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        isSeekingRef.current = true;
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        const p = playerRef.current;
        if (!p || durationRef.current === 0) return;
        const tw = getTrackWidth();
        // landscape এ Y axis উল্টো হয় তাই (tw - locationY) নিই
        const loc = isLandscapeRef.current
          ? tw - e.nativeEvent.locationY
          : e.nativeEvent.locationX;
        const ratio = Math.min(Math.max(loc / tw, 0), 1);
        setProgress(ratio);
        setCurrentTime(ratio * durationRef.current);
        p.currentTime = ratio * durationRef.current;
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        const p = playerRef.current;
        if (!p || durationRef.current === 0) return;
        const tw = getTrackWidth();
        const loc = isLandscapeRef.current
          ? tw - e.nativeEvent.locationY
          : e.nativeEvent.locationX;
        const ratio = Math.min(Math.max(loc / tw, 0), 1);
        setProgress(ratio);
        setCurrentTime(ratio * durationRef.current);
        p.currentTime = ratio * durationRef.current;
      },
      onPanResponderRelease: () => {
        isSeekingRef.current = false;
        resetControlsTimer();
      },
    }),
  ).current;

  // ── transform — video কে screen center এ রেখে rotate ──
  // React Native transform origin হলো center।
  // SCREEN_W x SCREEN_H view কে 90deg rotate করলে
  // এটা SCREEN_H x SCREEN_W হয়ে যায় visually।
  // কিন্তু center এ থাকে তাই translate দরকার নেই।
  const videoTransform = isLandscape ? [{ rotate: "90deg" }] : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
      supportedOrientations={["portrait"]}
    >
      <StatusBar hidden />
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Video */}
        <View
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            transform: videoTransform,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <VideoView
            player={player}
            style={{ width: SCREEN_W, height: SCREEN_H }}
            contentFit="contain"
            nativeControls={false}
          />
        </View>

        {/* Tap overlay */}
        <TouchableOpacity
          onPress={handleVideoTap}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {is2x && (
            <View
              style={{
                position: "absolute",
                top: 56,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                <Ionicons name="flash" size={13} color="#FFD700" />
                <Text
                  style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}
                >
                  ২× গতি
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Controls */}
        {showControls && (
          <VideoControls
            isPlaying={isPlaying}
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            isLandscape={isLandscape}
            screenW={SCREEN_W}
            screenH={SCREEN_H}
            onPlayPause={handlePlayPause}
            onClose={handleClose}
            onRotate={handleRotate}
            onSeekForward={handleSeekForward}
            onSeekBackward={handleSeekBackward}
            progressPanHandlers={progressPanResponder.panHandlers}
          />
        )}
      </View>
    </Modal>
  );
};

export default VideoFullScreen;
