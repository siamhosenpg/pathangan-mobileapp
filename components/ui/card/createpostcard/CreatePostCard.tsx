import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CreatePostCard = () => {
  const router = useRouter();
  const handleCreatePost = () => {
    router.push("/create");
  };
  return (
    <TouchableOpacity
      onPress={handleCreatePost}
      className="bg-background px-4 py-1"
    >
      <View className="flex-row items-center gap-3">
        {/* Left Icon Button */}
        <View className="w-11 h-11 rounded-full bg-gray-200 items-center justify-center">
          <Ionicons name="add" size={22} color="#4B5563" />
        </View>

        {/* Text */}
        <Text className="text-gray-600 text-base flex-1 leading-5 py-3">
          আপনি কি কিছু বলতে, প্রশ্ন করতে বা কোর্স আপলোড করতে চাচ্ছেন?
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CreatePostCard;
