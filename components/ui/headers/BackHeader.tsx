import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const BackHeader = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="bg-background dark:bg-dark-background border-b border-border/60 dark:border-dark-border/60 px-4 p-3 flex-row items-center gap-3  justify-center"
    >
      <View hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} className="">
        <AntDesign name="close-circle" size={20} color="black" />
      </View>

      <Text className="text-base font-bold text-text dark:text-dark-text">
        Back to Home
      </Text>
    </TouchableOpacity>
  );
};

export default BackHeader;
