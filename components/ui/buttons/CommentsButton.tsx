import Comments from "@/assets/icons/beacon.svg";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  onClick?: () => void;
}

const CommentsButton = ({ onClick }: Props) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";
  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row items-center gap-1.5 py-3.5"
    >
      <Comments width={16} height={16} color={iconColor} />
      <Text className="font-semibold text-base text-text dark:text-dark-text">
        {t("comments")}
      </Text>
    </TouchableOpacity>
  );
};

export default CommentsButton;
