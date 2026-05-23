import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { Header } from "@/components/ui/headers/Header";

type User = {
  id: string;
  name: string;
  username: string;
};

const demoUsers: User[] = [
  { id: "1", name: "Siam Hosen", username: "@siam" },
  { id: "2", name: "Rahim Uddin", username: "@rahim" },
  { id: "3", name: "Nusrat Jahan", username: "@nusrat" },
  { id: "4", name: "Tanvir Ahmed", username: "@tanvir" },
];

const PeopleScreen = () => {
  const renderItem = ({ item }: { item: User }) => {
    return (
      <View className="flex-row items-center justify-between bg-white px-4 py-3 mb-2 rounded-xl border border-gray-100">
        {/* Left Side */}
        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <View className="w-11 h-11 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={20} color="#6B7280" />
          </View>

          {/* Info */}
          <View>
            <Text className="text-base font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500">{item.username}</Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity className="px-4 py-1.5 rounded-full bg-green-600">
          <Text className="text-white text-sm font-semibold">Follow</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* 👇 Custom Header */}
      <Header title="ব্যবহারকারী" />

      {/* List */}
      <FlatList
        data={demoUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 80,
        }}
      />
    </View>
  );
};

export default PeopleScreen;
