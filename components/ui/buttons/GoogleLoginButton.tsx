import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { AntDesign } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function GoogleLoginButton() {
  const { promptAsync, request, isLoading } = useGoogleAuth();

  return (
    <TouchableOpacity
      onPress={() => promptAsync()}
      disabled={!request || isLoading}
      activeOpacity={0.75}
      className="w-full flex-row items-center justify-center gap-3 py-4 rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary disabled:opacity-50"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#00914d" />
      ) : (
        <>
          {/* Google icon circle */}
          <View className="w-6 h-6 items-center justify-center">
            <AntDesign name="google" size={18} color="#EA4335" />
          </View>

          <Text className="text-text dark:text-dark-text text-sm font-medium">
            Google দিয়ে লগইন করুন
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
