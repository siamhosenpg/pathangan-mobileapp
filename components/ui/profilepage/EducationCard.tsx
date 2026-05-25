import type { EducationEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface Props {
  education: EducationEntry;
}

const EducationCard = ({ education }: Props) => {
  return (
    <View className="flex-row items-center gap-3 border border-border dark:border-dark-border rounded-xl p-3">
      <View className="shrink-0">
        <Ionicons name="school-outline" size={36} color="#585858" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-text text-sm dark:text-dark-text">
          {education.institution}
        </Text>
        <Text className="text-text-secondary text-sm mt-0.5 dark:text-dark-text-secondary">
          {education.degree}
        </Text>
      </View>
    </View>
  );
};

export default EducationCard;
