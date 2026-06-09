import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CreatePostCard = () => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleCreatePost = () => {
    router.push("/create");
  };

  return (
    <TouchableOpacity
      onPress={handleCreatePost}
      activeOpacity={0.8}
      className="bg-background dark:bg-dark-background px-4 pt-3 pb-2"
    >
      {/* Main row */}
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full overflow-hidden bg-accent/20 items-center justify-center shrink-0">
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-accent font-bold text-base">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          )}
        </View>

        {/* Input placeholder box */}
        <View className="flex-1 flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-full px-4 py-2.5 gap-2">
          <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm flex-1">
            কিছু শেয়ার করুন...
          </Text>
          <Ionicons name="pencil" size={14} color={isDark ? "#555" : "#bbb"} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CreatePostCard;
