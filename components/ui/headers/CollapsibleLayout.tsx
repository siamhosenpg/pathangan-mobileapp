import type { CollapsibleHeaderState } from "@/hooks/header/useCollapsibleHeader";
import type { ReactNode } from "react";
import { Animated, View } from "react-native";

interface Props {
  collapsible: CollapsibleHeaderState;
  header: ReactNode;
  children: ReactNode;
}

export default function CollapsibleLayout({
  collapsible,
  header,
  children,
}: Props) {
  const { translate, onBarLayout } = collapsible;

  return (
    <View className="flex-1 overflow-hidden">
      {/* Body: কখনো নড়ে না। list নিজে paddingTop = barH নেবে */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Header (+ tabs): শুধু এটাই উপরে উঠবে */}
      <Animated.View
        onLayout={onBarLayout}
        className="bg-background dark:bg-dark-background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: [{ translateY: translate }],
        }}
      >
        {header}
      </Animated.View>
    </View>
  );
}
