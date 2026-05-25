import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  View,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet = ({ visible, onClose, children }: Props) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-[999] justify-end">
      {/* Backdrop */}
      <Pressable className="absolute inset-0" onPress={onClose}>
        <Animated.View
          style={{ opacity: backdropOpacity }}
          className="flex-1 bg-background-transparent dark:bg-dark-background-transparent"
        />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateY }] }}
        className="max-h-[80%] h-full bg-background dark:bg-dark-background rounded-t-3xl pb-8"
      >
        {/* handle */}
        <View className="w-14 h-1.5 bg-border dark:bg-dark-border rounded-full self-center mt-3 mb-4" />

        {children}
      </Animated.View>
    </View>
  );
};

export default BottomSheet;
