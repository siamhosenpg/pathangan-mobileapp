import { toggleMute } from "@/redux/features/video/videoSlice";
import type { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  isLandscape: boolean;
  containerW: number; // rotated container এর actual width
  containerH: number; // rotated container এর actual height
  onPlayPause: () => void;
  onClose: () => void;
  onRotate: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  progressPanHandlers: any;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PADDING = 20;

const VideoControls = ({
  isPlaying,
  progress,
  currentTime,
  duration,
  isLandscape,
  containerW,
  containerH,
  onPlayPause,
  onClose,
  onRotate,
  onSeekForward,
  onSeekBackward,
  progressPanHandlers,
}: Props) => {
  const dispatch = useDispatch();
  const isMuted = useSelector((state: RootState) => state.video.isMuted);

  const paddingTop = isLandscape ? 14 : 52;
  const paddingBottom = isLandscape ? 14 : 44;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: containerW,
        height: containerH,
      }}
    >
      {/* ── Top bar ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop,
          paddingHorizontal: PADDING,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <Ionicons name="chevron-down" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={onRotate}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Ionicons
              name={
                isLandscape
                  ? "phone-portrait-outline"
                  : "phone-landscape-outline"
              }
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(toggleMute())}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Ionicons
              name={isMuted ? "volume-mute" : "volume-high"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Center controls ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: containerW,
          height: containerH,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
        }}
      >
        <TouchableOpacity
          onPress={onSeekBackward}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Ionicons
              name="play-back-circle"
              size={54}
              color="rgba(255,255,255,0.88)"
            />
            <Text
              style={{
                position: "absolute",
                color: "#fff",
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              10
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          activeOpacity={0.85}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.5)",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={34}
            color="#fff"
            style={{ marginLeft: isPlaying ? 0 : 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSeekForward}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Ionicons
              name="play-forward-circle"
              size={54}
              color="rgba(255,255,255,0.88)"
            />
            <Text
              style={{
                position: "absolute",
                color: "#fff",
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              10
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Bottom controls ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom,
          paddingTop: 16,
          paddingHorizontal: PADDING,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(currentTime)}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              marginHorizontal: 4,
            }}
          >
            /
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(duration)}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          style={{ height: 30, justifyContent: "center" }}
          {...progressPanHandlers}
        >
          <View
            style={{
              height: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 3,
            }}
          >
            <View
              style={{
                height: 3,
                width: `${progress * 100}%`,
                backgroundColor: "#fff",
                borderRadius: 3,
              }}
            />
            <View
              style={{
                position: "absolute",
                left: `${progress * 100}%`,
                top: -5.5,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#fff",
                marginLeft: -7,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default VideoControls;
