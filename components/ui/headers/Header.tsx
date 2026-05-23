import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function Header({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <View className="bg-background px-4 pt-14 pb-3 border-b border-border">
      <View className="flex-row items-center justify-between">
        {title ? (
          <View className="flex-row items-center gap-2 h-10">
            <Text
              className={`text-xl font-semibold ${title ? "text-gray-900" : "text-green-600"}`}
            >
              {title}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-2 w-32 h-10 -ml-1">
            <Image
              source={require("../../../assets/logo/pathangan.png")}
              className="w-full object-cover h-full "
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search" as any)}
          >
            <Ionicons name="search-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#6B7280" />
        </View>
      </View>
    </View>
  );
}
