import type { EducationEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface Props {
  education: EducationEntry;
}

const EducationCard = ({ education }: Props) => {
  return (
    <View className="flex-row items-center gap-3 bg-background dark:bg-dark-background rounded-2xl py-1">
      <View className="w-11 h-11 rounded-xl border-border border dark:border-dark-border items-center justify-center shrink-0">
        <Ionicons name="school-outline" size={20} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold  text-text dark:text-dark-text">
          {education.institution}
        </Text>
        <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm mt-0.5">
          {education.degree}
        </Text>
      </View>
    </View>
  );
};

export default EducationCard;
