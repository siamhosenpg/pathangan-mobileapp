import type { WorkEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface Props {
  work: WorkEntry;
}

const WorkCard = ({ work }: Props) => {
  return (
    <View className="flex-row items-center gap-3 border border-border rounded-xl p-3">
      <View className="shrink-0">
        <Ionicons name="briefcase-outline" size={36} color="#585858" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-text text-sm">{work.industry}</Text>
        <Text className="text-text-secondary text-sm mt-0.5">
          {work.position}
        </Text>
      </View>
    </View>
  );
};

export default WorkCard;
