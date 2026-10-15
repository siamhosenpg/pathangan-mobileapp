import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface Props {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: Props) {
  const { t } = useTranslation();

  return (
    <View className="items-center mb-8">
      <Image
        source={require("@/assets/images/favicon.png")}
        style={{ width: 72, height: 72 }}
        contentFit="contain"
      />

      <Text className="text-2xl font-bold text-text dark:text-dark-text mb-1.5 tracking-tight">
        {title}
      </Text>
      <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm text-center">
        {subtitle}
      </Text>
    </View>
  );
}
