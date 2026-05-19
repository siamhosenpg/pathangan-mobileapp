import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  onClick?: () => void;
}

const CommentsButton = ({ onClick }: Props) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row items-center gap-1.5"
    >
      <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
      <Text className="font-semibold text-base text-text-secondary">মতামত</Text>
    </TouchableOpacity>
  );
};

export default CommentsButton;
