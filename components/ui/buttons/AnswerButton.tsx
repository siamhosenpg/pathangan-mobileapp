import AnswerIcon from "@/assets/icons/questionlite.svg";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  onClick?: () => void;
}

const AnswerButton = ({ onClick }: Props) => {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  const iconColor = colorScheme === "dark" ? "#f1f1f1" : "#1b1b1b";

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.7}
      className="flex-row items-center gap-1.5"
    >
      <AnswerIcon width={17} height={17} color={iconColor} />

      <Text className="font-semibold text-base text-text dark:text-dark-text">
        {t("answers")}
      </Text>
    </TouchableOpacity>
  );
};

export default AnswerButton;
