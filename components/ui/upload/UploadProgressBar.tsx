import { resetUpload } from "@/redux/features/upload/uploadSlice";
import type { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const UploadProgressBar = () => {
  const dispatch = useDispatch();
  const { progress, status } = useSelector((state: RootState) => state.upload);

  const widthAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // fade out করে তারপর state reset করে (done-এর timer আর close বাটন দুটোই এটা ব্যবহার করে)
  const hide = useCallback(() => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => dispatch(resetUpload()));
  }, [dispatch, opacityAnim]);

  useEffect(() => {
    if (status === "idle") {
      opacityAnim.setValue(0);
      widthAnim.setValue(0);
      return;
    }

    // fade in
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // progress bar width
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // success হলে ২ সেকেন্ড পর নিজে নিজে hide
    if (status === "done") {
      const timer = setTimeout(hide, 2000);
      return () => clearTimeout(timer);
    }
    // error হলে auto hide হবে না, ইউজার close চাপলে হবে
  }, [progress, status, hide, opacityAnim, widthAnim]);

  if (status === "idle") return null;

  const isDone = status === "done";
  const isError = status === "error";

  return (
    <Animated.View
      style={{ opacity: opacityAnim }}
      className="overflow-hidden bg-background dark:bg-dark-background border-b border-border dark:border-dark-border"
    >
      <View className="px-4 pt-3 pb-2">
        {/* Top row */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2 flex-1">
            {isError ? (
              // error হলে বাম পাশে close বাটন
              <TouchableOpacity
                onPress={hide}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="বন্ধ করুন"
                className="w-6 h-6 rounded-full bg-red-500/15 items-center justify-center"
              >
                <Ionicons name="close" size={14} color="#ef4444" />
              </TouchableOpacity>
            ) : isDone ? (
              <View className="w-6 h-6 rounded-full bg-green-500/15 items-center justify-center">
                <Ionicons name="checkmark" size={14} color="#22c55e" />
              </View>
            ) : (
              <View className="w-6 h-6 rounded-full bg-accent/15 items-center justify-center">
                <Ionicons
                  name="cloud-upload-outline"
                  size={14}
                  color="#6366f1"
                />
              </View>
            )}
            <Text className="text-text dark:text-dark-text text-sm font-semibold">
              {isDone
                ? "পোস্ট সম্পন্ন হয়েছে"
                : isError
                  ? "আপলোড ব্যর্থ হয়েছে"
                  : "পোস্ট আপলোড হচ্ছে..."}
            </Text>
          </View>
          <Text
            className={`text-xs font-bold ${
              isDone
                ? "text-green-500"
                : isError
                  ? "text-red-500"
                  : "text-accent"
            }`}
          >
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Progress bar */}
        <View className="h-1.5 rounded-full bg-background-secondary dark:bg-dark-background-secondary overflow-hidden">
          <Animated.View
            style={{
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              height: "100%",
              borderRadius: 999,
              backgroundColor: isDone
                ? "#22c55e"
                : isError
                  ? "#ef4444"
                  : "#6366f1",
            }}
          />
        </View>

        {/* Sub text */}
        {!isDone && !isError && (
          <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-1.5">
            ফিড ব্রাউজ করতে পারেন, আপলোড চলতে থাকবে
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

export default UploadProgressBar;
