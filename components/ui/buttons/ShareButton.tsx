import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

const ShareButton = () => {
  return (
    <TouchableOpacity className="flex-row items-center gap-1.5">
      <Ionicons name="share-social-outline" size={20} color="#9CA3AF" />
      <Text className="font-semibold text-base text-text-secondary">
        প্রচার
      </Text>
    </TouchableOpacity>
  );
};

export default ShareButton;
