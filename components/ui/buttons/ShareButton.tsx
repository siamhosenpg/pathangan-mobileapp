import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity } from "react-native";

const ShareButton = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";
  return (
    <TouchableOpacity className="flex-row items-center gap-1.5 py-3">
      <Ionicons name="share-social-outline" size={20} color={iconColor} />
      <Text className="font-semibold text-base text-text dark:text-dark-text">
        প্রচার
      </Text>
    </TouchableOpacity>
  );
};

export default ShareButton;
