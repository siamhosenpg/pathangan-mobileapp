import { toggleAutoPlay } from "@/redux/features/video/videoSlice";
import type { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Switch, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function VideoAutoplay() {
  const dispatch = useDispatch();
  const isAutoPlay = useSelector((state: RootState) => state.video.isAutoPlay);

  const handleAutoPlayToggle = useCallback(
    (_: boolean) => {
      dispatch(toggleAutoPlay());
    },
    [dispatch],
  );

  return (
    <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-xl border border-border dark:border-dark-border overflow-hidden">
      {/* card header */}
      <View className="flex-row items-center gap-2.5 px-4 py-3 border-b border-border dark:border-dark-border">
        <View className="w-8 h-8 rounded-lg bg-background-secondary dark:bg-dark-background-secondary items-center justify-center">
          <Ionicons name="videocam-outline" size={17} color="#888" />
        </View>
        <Text className="text-sm font-medium text-text dark:text-dark-text">
          ভিডিও সেটিংস
        </Text>
      </View>

      {/* auto-play row */}
      <View className="flex-row items-center justify-between px-4 py-3.5 gap-4">
        <View className="flex-row items-center gap-2.5 flex-1">
          <View className="w-9 h-9 rounded-lg bg-background-secondary dark:bg-dark-background-secondary items-center justify-center">
            <Ionicons name="play-outline" size={17} color="#888" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-text dark:text-dark-text">
              ভিডিও অটো-প্লে
            </Text>
            <Text
              className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5"
              numberOfLines={1}
            >
              স্ক্রল করলে ভিডিও স্বয়ংক্রিয়ভাবে চলবে
            </Text>
          </View>
        </View>

        <Switch
          value={isAutoPlay}
          onValueChange={handleAutoPlayToggle}
          trackColor={{ false: "#767577", true: "#00914d" }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}
