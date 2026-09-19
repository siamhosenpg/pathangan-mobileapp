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
    <View className="flex-row items-center gap-3 bg-background dark:bg-dark-background rounded-2xl  py-1">
      <View className="w-11 h-11 rounded-xl border-border border dark:border-dark-border items-center justify-center shrink-0">
        <Ionicons name="briefcase-outline" size={20} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold  text-text dark:text-dark-text">
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
