import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface GreenMarkProps {
  mark: boolean;
  size?: number;
  style?: ViewStyle;
}

const GreenMark = ({ mark, size = 18, style }: GreenMarkProps) => {
  if (!mark) return null;

  return (
    <View style={[styles.container, style]} className=" text-accent">
      <MaterialIcons
        name="verified"
        size={size}
        className="text-accent"
        color="#00914d"
      />
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
