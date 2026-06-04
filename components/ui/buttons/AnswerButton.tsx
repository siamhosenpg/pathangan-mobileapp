import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  onClick?: () => void;
}

const AnswerButton = ({ onClick }: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row items-center gap-1.5"
    >
      <Ionicons name="create-outline" size={20} color={iconColor} />
      <Text className="font-semibold text-base text-text dark:text-dark-text">
        {t("answers")}
      </Text>
    </TouchableOpacity>
  );
};

export default AnswerButton;
