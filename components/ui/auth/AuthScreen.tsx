import { useRef, useState } from "react";
import { Keyboard, View } from "react-native";
import Animated, {
  Easing,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";

type Mode = "login" | "register";

const DURATION = 320;
const EASING = Easing.inOut(Easing.cubic);

export default function AuthScreen({
  initialMode = "login",
}: {
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  // প্রথমবার স্ক্রিন খুললে যেন অ্যানিমেশন না চলে
  const switched = useRef(false);

  const go = (next: Mode) => {
    Keyboard.dismiss();
    switched.current = true;
    setMode(next);
  };

  return (
    <View className="flex-1 overflow-hidden bg-background dark:bg-dark-background">
      {mode === "login" ? (
        <Animated.View
          key="login"
          style={{ flex: 1 }}
          entering={
            switched.current
              ? SlideInLeft.duration(DURATION).easing(EASING)
              : undefined
          }
          exiting={SlideOutLeft.duration(DURATION).easing(EASING)}
        >
          <LoginForm onSwitch={() => go("register")} />
        </Animated.View>
      ) : (
        <Animated.View
          key="register"
          style={{ flex: 1 }}
          entering={SlideInRight.duration(DURATION).easing(EASING)}
          exiting={SlideOutRight.duration(DURATION).easing(EASING)}
        >
          <RegisterForm onSwitch={() => go("login")} />
        </Animated.View>
      )}
    </View>
  );
}
