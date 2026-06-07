import React, { useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 150;
const DISMISS_VELOCITY = 800;

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const OPEN_SPRING = {
  damping: 60,
  stiffness: 500,
  mass: 1,
  overshootClamping: false,
};

const SNAP_SPRING = {
  damping: 40,
  stiffness: 400,
  mass: 0.8,
};

const BottomSheet = ({ visible, onClose, children }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // ✅ keyboard height track করো — sheet manually উপরে উঠবে
  React.useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        translateY.value = withSpring(0, OPEN_SPRING);
        backdropOpacity.value = withTiming(1, { duration: 250 });
      });
    } else {
      // close হলে keyboard dismiss করো
      Keyboard.dismiss();
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 180,
        easing: Easing.in(Easing.ease),
      });
      backdropOpacity.value = withTiming(
        0,
        { duration: 160, easing: Easing.in(Easing.ease) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [visible]);

  const handleGesture = Gesture.Pan()
    .onUpdate((e) => {
      const next = e.translationY;
      if (next >= 0) {
        translateY.value = next * 0.85;
      }
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > DISMISS_THRESHOLD || e.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, SNAP_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return null;

  const isEmpty =
    !children || (Array.isArray(children) && children.length === 0);

  return (
    <View className="absolute inset-0 z-[999] justify-end">
      {/* Backdrop */}
      <Pressable className="absolute inset-0" onPress={onClose}>
        <Animated.View
          style={backdropStyle}
          className="flex-1 bg-background-transparent dark:bg-dark-background-transparent"
        />
      </Pressable>

      {/* Sheet — keyboard height অনুযায়ী marginBottom */}
      <Animated.View
        style={[
          sheetStyle,
          {
            flex: 1,
            maxHeight: SCREEN_HEIGHT * 0.8,
            minHeight: isEmpty ? SCREEN_HEIGHT * 0.3 : undefined,
            // ✅ এটাই আসল trick — sheet নিচ থেকে keyboard height সরে যায়
            marginBottom: keyboardHeight,
          },
        ]}
        className="bg-background dark:bg-dark-background rounded-t-3xl pb-8"
      >
        {/* Handle bar */}
        <GestureDetector gesture={handleGesture}>
          <View className="pb-2">
            <View className="w-14 h-1.5 bg-border dark:bg-dark-border rounded-full self-center mt-3 mb-2" />
          </View>
        </GestureDetector>

        {isEmpty ? (
          <View className="flex-1 items-center justify-center gap-2">
            <Text className="text-3xl">📭</Text>
            <Text className="text-text-secondary dark:text-dark-text-secondary text-sm">
              কোনো তথ্য নেই
            </Text>
          </View>
        ) : (
          <View className="flex-1">{children}</View>
        )}
      </Animated.View>
    </View>
  );
};

export default BottomSheet;
