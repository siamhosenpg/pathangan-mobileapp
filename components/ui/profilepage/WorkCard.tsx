import type { WorkEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

interface Props {
  work: WorkEntry;
}

const WorkCard = ({ work }: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3">
      <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center shrink-0">
        <Ionicons name="briefcase-outline" size={20} color="#00914d" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-sm text-text dark:text-dark-text">
          {work.industry}
        </Text>
        <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm mt-0.5">
          {work.position}
        </Text>
      </View>
    </View>
  );
};

export default WorkCard;
