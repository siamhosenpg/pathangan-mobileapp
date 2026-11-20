import { useIconColor } from "@/hooks/useIconColor";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const VB = { x: -20, y: -80, w: 314.2, h: 364.52 };
const DURATION = 3200;
const ease = Easing.bezier(0.45, 0, 0.25, 1);

const LEFT_PATH =
  "M112.93,191.54V338.27s-1.51,11.75,17.51,15.85c0,0,56.46,13.52,76.39,31.56,0,0,24.45,22.26,24.15,0s0-145.09,0-145.09-2.87-20.91-28.68-30.33L130.74,184S116,177.33,112.93,191.54Z";

const RIGHT_PATH =
  "M387.07,191.54V338.27s1.51,11.75-17.51,15.85c0,0-56.46,13.52-76.39,31.56,0,0-24.45,22.26-24.15,0s0-145.09,0-145.09,2.87-20.91,28.68-30.33L369.26,184S384.05,177.33,387.07,191.54Z";

type Props = {
  // লোগোর প্রস্থ (পিক্সেল), উচ্চতা নিজে থেকে মিলে যাবে
  size?: number;
  // না দিলে theme এর secondary আইকন রং ব্যবহার হবে
  color?: string;
  // false হলে animation থেমে থাকবে (লুকানো অবস্থায় বাড়তি কাজ আটকাতে)
  active?: boolean;
};

export default function AnimatedLogo({
  size = 36,
  color,
  active = true,
}: Props) {
  const { secondary } = useIconColor();
  const fill = color ?? secondary;

  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    t.setValue(0);

    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();
    return () => loop.stop();
  }, [t, active]);

  const anim = useMemo(() => {
    const s = size / VB.w;
    const W = size;
    const H = VB.h * s;

    const offset = (cx: number, cy: number) => ({
      dx: (cx - VB.x) * s - W / 2,
      dy: (cy - VB.y) * s - H / 2,
    });

    const keyframes = (input: number[], output: number[]) =>
      t.interpolate({
        inputRange: input,
        outputRange: output,
        easing: ease,
      });

    // মাথার animation
    const headIn = [0, 0.22, 0.3, 0.38, 0.56, 0.78, 0.84, 0.9, 1];

    const headY = keyframes(
      headIn,
      [-55, 5, 0, 0, -26, 2, 0, 0, -55].map((v) => v * s),
    );
    const headScale = keyframes(headIn, [0.6, 1.04, 1, 1, 1, 1, 1, 1, 0.6]);
    const headOpacity = keyframes(headIn, [0, 1, 1, 1, 1, 1, 1, 1, 0]);
    const head = offset(137.6, 44.15);

    // বইয়ের animation
    const bookIn = [0, 0.38, 0.56, 0.78, 0.86, 1];

    const bookY = keyframes(
      bookIn,
      [0, 0, -2, 0, 0, 0].map((v) => v * s),
    );

    const leftRotate = keyframes(bookIn, [0, 0, 9, -1.5, 0, 0]).interpolate({
      inputRange: [-360, 360],
      outputRange: ["-360deg", "360deg"],
    });

    const rightRotate = keyframes(bookIn, [0, 0, -9, 1.5, 0, 0]).interpolate({
      inputRange: [-360, 360],
      outputRange: ["-360deg", "360deg"],
    });

    const book = offset(137.1, 268);

    return {
      W,
      H,

      headStyle: {
        opacity: headOpacity,
        transform: [
          { translateY: headY },
          { translateX: head.dx },
          { translateY: head.dy },
          { scale: headScale },
          { translateX: -head.dx },
          { translateY: -head.dy },
        ],
      },

      leftStyle: {
        transform: [
          { translateY: bookY },
          { translateX: book.dx },
          { translateY: book.dy },
          { rotate: leftRotate },
          { translateX: -book.dx },
          { translateY: -book.dy },
        ],
      },

      rightStyle: {
        transform: [
          { translateY: bookY },
          { translateX: book.dx },
          { translateY: book.dy },
          { rotate: rightRotate },
          { translateX: -book.dx },
          { translateY: -book.dy },
        ],
      },
    };
  }, [size, t]);

  const layer = {
    position: "absolute" as const,
    left: 0,
    top: 0,
    width: anim.W,
    height: anim.H,
  };

  const viewBox = `${VB.x} ${VB.y} ${VB.w} ${VB.h}`;

  return (
    <View
      pointerEvents="none"
      style={{ width: anim.W, height: anim.H, overflow: "visible" }}
    >
      {/* বাঁ বই */}
      <Animated.View style={[layer, anim.leftStyle]}>
        <Svg width={anim.W} height={anim.H} viewBox={viewBox}>
          <Path
            d={LEFT_PATH}
            fill={fill}
            transform="translate(-112.9 -111.05)"
          />
        </Svg>
      </Animated.View>

      {/* ডান বই */}
      <Animated.View style={[layer, anim.rightStyle]}>
        <Svg width={anim.W} height={anim.H} viewBox={viewBox}>
          <Path
            d={RIGHT_PATH}
            fill={fill}
            transform="translate(-112.9 -111.05)"
          />
        </Svg>
      </Animated.View>

      {/* মাথা */}
      <Animated.View style={[layer, anim.headStyle]}>
        <Svg width={anim.W} height={anim.H} viewBox={viewBox}>
          <Circle cx={137.6} cy={44.15} r={44.15} fill={fill} />
        </Svg>
      </Animated.View>
    </View>
  );
}
