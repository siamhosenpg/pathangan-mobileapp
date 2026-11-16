import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  message?: string;
  onRetry?: () => void;
}

/**
 * List/screen এ data আনতে fail করলে এটা দেখাবে।
 *
 * ব্যবহার:
 *   const { data, error, isLoading, refetch } = useGetPostsQuery();
 *   if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
 */
const ErrorState = ({ message, onRetry }: Props) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 items-center justify-center px-8 py-10 gap-3">
      <View className="w-16 h-16 rounded-full items-center justify-center bg-red-500/10">
        <Ionicons name="cloud-offline-outline" size={30} color="#EF4444" />
      </View>

      <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
        {message ?? t("errorMessages.generic")}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          className="flex-row items-center gap-2 mt-2 px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
        >
          <Ionicons
            name="refresh"
            size={15}
            color={isDark ? "#c4c4c4" : "#3a3a3a"}
          />
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            {t("common.retry")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
