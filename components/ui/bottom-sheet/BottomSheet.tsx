import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 150;
const DISMISS_VELOCITY = 800;

const MAX_SHEET_RATIO = 0.85; // স্ক্রিনের সর্বোচ্চ ৮৫% পর্যন্ত
const TOP_GAP = 16; // safe area top এর পরে বাড়তি জায়গা
const HANDLE_AREA = 34; // mt-3(12) + h-1.5(6) + mb-2(8) + pb-2(8)
const BOTTOM_PADDING = 16; // safe area bottom এর সাথে যোগ হবে

interface Props {
  visible: boolean;
  /**
   * user backdrop এ tap করলে বা নিচে drag করে বন্ধ করতে চাইলে এটা call হয়।
   * false return করলে বুঝব বন্ধ হয়নি (guard আটকেছে) — sheet আগের জায়গায় ফিরে যাবে।
   */
  onClose: () => boolean | void;
  children: React.ReactNode;
  /**
   * true (default): children ScrollView এর ভেতরে render হবে।
   * false: children সরাসরি render হবে (FlatList/SectionList এর জন্য),
   * তখন ওই list নিজেই scroll handle করবে।
   */
  scrollable?: boolean;
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

const BottomSheet = ({
  visible,
  onClose,
  children,
  scrollable = true,
}: Props) => {
  const [mounted, setMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // keyboard এর height track করি — sheet উপরে উঠবে
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
      // বন্ধ হলে keyboard নামিয়ে দিই
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

  // user বন্ধ করতে চাইলে (backdrop / drag) — guard আটকালে sheet ফিরে আসে
  const requestClose = () => {
    const result = onClose();
    if (result === false) {
      translateY.value = withSpring(0, SNAP_SPRING);
    }
  };

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
        runOnJS(requestClose)();
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

  // keyboard খোলা থাকলে নিচের safe area লাগে না, তাই তখন ছোট padding
  const bottomPadding =
    keyboardHeight > 0 ? BOTTOM_PADDING : insets.bottom + BOTTOM_PADDING;

  // Sheet এর সর্বোচ্চ দৃশ্যমান height: স্ক্রিনের ৮৫%,
  // আর keyboard + status bar এর জায়গা বাদ দিয়ে
  const maxSheetHeight = Math.min(
    SCREEN_HEIGHT * MAX_SHEET_RATIO,
    SCREEN_HEIGHT - keyboardHeight - insets.top - TOP_GAP,
  );

  // Content অংশের সর্বোচ্চ height = sheet max - handle - bottom padding
  const maxContentHeight = Math.max(
    maxSheetHeight - HANDLE_AREA - bottomPadding,
    0,
  );

  return (
    <View className="absolute inset-0 z-[999] justify-end">
      {/* Backdrop */}
      <Pressable className="absolute inset-0" onPress={requestClose}>
        <Animated.View
          style={backdropStyle}
          className="flex-1 bg-background-transparent dark:bg-dark-background-transparent"
        />
      </Pressable>

      {/* 
        Sheet — এখন স্ক্রিনের একদম নিচ পর্যন্ত নামানো।
        আগে marginBottom দিয়ে উপরে তোলা হতো, তাতে নিচে ফাঁক তৈরি হতো।
        এখন keyboard এর উচ্চতা paddingBottom এ যোগ হয়েছে, তাই
        keyboard এর পেছনের অংশ sheet এর নিজের রঙেই (সাদা/ডার্ক) ভরা থাকে।
      */}
      <Animated.View
        style={[
          sheetStyle,
          {
            // padding সহ মোট height, তাই keyboardHeight যোগ করা হয়েছে
            maxHeight: maxSheetHeight + keyboardHeight,
            minHeight: isEmpty
              ? SCREEN_HEIGHT * 0.3 + keyboardHeight
              : undefined,
            paddingBottom: bottomPadding + keyboardHeight,
          },
        ]}
        className="bg-background dark:bg-dark-background rounded-t-3xl"
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
              {t("noDataAvailable")}
            </Text>
          </View>
        ) : scrollable ? (
          <ScrollView
            style={{ flexGrow: 0, maxHeight: maxContentHeight }}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {children}
          </ScrollView>
        ) : (
          <View style={{ flexShrink: 1, maxHeight: maxContentHeight }}>
            {children}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default BottomSheet;
