import type { EducationEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface Props {
  education: EducationEntry;
}

const EducationCard = ({ education }: Props) => {
  return (
    <View className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3">
      <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center shrink-0">
        <Ionicons name="school-outline" size={20} color="#00914d" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-sm text-text dark:text-dark-text">
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
