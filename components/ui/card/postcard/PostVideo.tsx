import { toggleMute } from "@/redux/features/video/videoSlice";
import type { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { AppState, Dimensions, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  uri: string;
  isVisible: boolean;
  isNearVisible?: boolean;
  videoMeta?: { width: number; height: number };
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_HEIGHT = 500;
const MIN_HEIGHT = SCREEN_WIDTH * 0.5;
const DEFAULT_HEIGHT = SCREEN_WIDTH * (9 / 16);

const PostVideo = ({
  uri,
  isVisible,
  isNearVisible = false,
  videoMeta,
}: Props) => {
  const dispatch = useDispatch();
  const isMuted = useSelector((state: RootState) => state.video.isMuted);
  const appStateRef = useRef(AppState.currentState);

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

  useEffect(() => {
    if (!player) return;
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (!player) return;
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (!player) return;
      if (
        appStateRef.current === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        player.pause();
      }
      if (
        appStateRef.current !== "active" &&
        nextState === "active" &&
        isVisible
      ) {
        player.play();
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [player, isVisible]);

  // shouldLoad false হলে placeholder
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

  return (
    <View
      style={{ width: SCREEN_WIDTH, height: videoHeight }}
      className="bg-black"
    >
      <VideoView
        player={player}
        style={{ width: SCREEN_WIDTH, height: videoHeight }}
        contentFit="cover"
        nativeControls={false}
      />
      <TouchableOpacity
        onPress={() => dispatch(toggleMute())}
        className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2.5"
        activeOpacity={0.8}
      >
        <Ionicons name={isMuted ? "mic-off" : "mic"} size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default PostVideo;
