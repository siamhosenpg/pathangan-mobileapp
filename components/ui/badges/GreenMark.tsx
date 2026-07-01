import Badge from "@/assets/icons/badge.svg";
import { useIconColor } from "@/hooks/useIconColor";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface GreenMarkProps {
  mark: boolean;
  size?: number;
  style?: ViewStyle;
}

const GreenMark = ({ mark, size = 18, style }: GreenMarkProps) => {
  const { accent } = useIconColor();
  if (!mark) return null;

  return (
    <View style={[styles.container, style]} className=" text-accent">
      <Badge width={size} height={size} color={accent} />
    </View>
  );
};

export default GreenMark;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
