import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

const BackHeader = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/feed");
    }
  };

  return (
    <TouchableOpacity
      onPress={handleBack}
      className="bg-background dark:bg-dark-background border-b border-border/60 dark:border-dark-border/60 px-4 p-3 flex-row items-center gap-3 justify-center"
    >
      <View hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <AntDesign
          name="close-circle"
          size={20}
          color={isDark ? "#ffffff" : "#000000"}
        />
      </View>

      <Text className="text-base font-bold text-text dark:text-dark-text">
        Back to Home
      </Text>
    </TouchableOpacity>
  );
};

export default BackHeader;
