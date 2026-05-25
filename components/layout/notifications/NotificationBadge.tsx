import React from "react";
import { Text, View } from "react-native";

interface Props {
  count: number;
}

const NotificationBadge = ({ count }: Props) => {
  if (count === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 999,
        backgroundColor: "red",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 10,
          fontWeight: "bold",
        }}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};

export default NotificationBadge;
