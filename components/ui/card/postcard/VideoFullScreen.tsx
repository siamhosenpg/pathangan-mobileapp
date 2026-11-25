import { Ionicons } from "@expo/vector-icons";
import type { VideoPlayer } from "expo-video";
import { VideoView } from "expo-video";
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
import VideoControls from "./VideoControls";

interface Props {
  // feed এর PostVideo এর একই player: নতুন করে লোড হয় না, timeline একই থাকে
  player: VideoPlayer;
  visible: boolean;
  onClose: () => void;
  videoMeta?: { width: number; height: number };
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PADDING = 20;

const VideoFullScreen = ({ player, visible, onClose }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [is2x, setIs2x] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  const durationRef = useRef(0);
  const isSeekingRef = useRef(false);
  const playerRef = useRef<any>(player);
  playerRef.current = player;
  const is2xActiveRef = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLandscapeRef = useRef(false);

  // ── Landscape হলে container size swap ──
  // Portrait:  container = SCREEN_W x SCREEN_H
  // Landscape: wrapper কে 90deg rotate করলে visually SCREEN_H wide,
  //            SCREEN_W tall হয়, তাই container কে SCREEN_H x SCREEN_W দিই
  const containerW = isLandscape ? SCREEN_H : SCREEN_W;
  const containerH = isLandscape ? SCREEN_W : SCREEN_H;

  // progress bar এর track width — container এর width অনুযায়ী
  const trackWidth = containerW - PADDING * 2;
  const trackWidthRef = useRef(trackWidth);
  useEffect(() => {
    trackWidthRef.current = trackWidth;
  }, [trackWidth]);

  // ── খোলা/বন্ধ হওয়া ──
  // player আগে থেকেই লোড ও সঠিক সময়ে আছে, তাই seek বা নতুন লোডের দরকার নেই।
  // শুধু play চালু রাখি আর আইকনকে player-এর আসল অবস্থার সাথে মেলাই।
  useEffect(() => {
    if (!visible) {
      setIsLandscape(false);
      isLandscapeRef.current = false;
      setIs2x(false);
      is2xActiveRef.current = false;
      return;
    }

    try {
      player.play();
    } catch {}
    setIsPlaying(!!player.playing);

    const playingSub = player.addListener("playingChange", (e: any) => {
      setIsPlaying(!!e.isPlaying);
    });

    resetControlsTimer();

    return () => {
      playingSub.remove();
    };
  }, [visible, player]);

  // ── progress আপডেট ──
  useEffect(() => {
    if (!visible) return;
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

  // unmount হলে সব timer পরিষ্কার
  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

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
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      setShowControls(true);
    } else {
      p.play();
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
    // ২x এ থাকলে স্বাভাবিক গতিতে ফেরাও, কারণ player টা feed এ ফিরে যাচ্ছে
    try {
      if (playerRef.current) playerRef.current.playbackRate = 1;
    } catch {}
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
  // wrapper rotate হলেও container নিজেই rotated, তাই progress bar
  // container-এর ভেতরে আগের মতোই horizontal থাকে।
  // ফলে শুধু locationX দিয়েই সঠিক ratio পাওয়া যায়।
  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        isSeekingRef.current = true;
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        const p = playerRef.current;
        if (!p || durationRef.current === 0) return;
        const tw = trackWidthRef.current;
        const ratio = Math.min(Math.max(e.nativeEvent.locationX / tw, 0), 1);
        setProgress(ratio);
        setCurrentTime(ratio * durationRef.current);
        p.currentTime = ratio * durationRef.current;
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        const p = playerRef.current;
        if (!p || durationRef.current === 0) return;
        const tw = trackWidthRef.current;
        const ratio = Math.min(Math.max(e.nativeEvent.locationX / tw, 0), 1);
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

  // ── Video আর Controls একটা wrapper-এ, wrapper-টাই rotate হয় ──
  // wrapper position: screen center-এ
  const wrapperTop = (SCREEN_H - containerH) / 2;
  const wrapperLeft = (SCREEN_W - containerW) / 2;

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

      {/* Full screen black background */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
        }}
      >
        {/* ── Rotatable wrapper — video + controls একসাথে ── */}
        <View
          style={{
            position: "absolute",
            top: wrapperTop,
            left: wrapperLeft,
            width: containerW,
            height: containerH,
            transform: isLandscape ? [{ rotate: "90deg" }] : [],
            overflow: "hidden",
          }}
        >
          {/* Video (feed এর একই player) */}
          <VideoView
            player={player}
            style={{ width: containerW, height: containerH }}
            contentFit="contain"
            nativeControls={false}
          />

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
            {/* 2x badge */}
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

          {/* Controls — wrapper এর ভেতরেই */}
          {showControls && (
            <VideoControls
              isPlaying={isPlaying}
              progress={progress}
              currentTime={currentTime}
              duration={duration}
              isLandscape={isLandscape}
              containerW={containerW}
              containerH={containerH}
              onPlayPause={handlePlayPause}
              onClose={handleClose}
              onRotate={handleRotate}
              onSeekForward={handleSeekForward}
              onSeekBackward={handleSeekBackward}
              progressPanHandlers={progressPanResponder.panHandlers}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default VideoFullScreen;
