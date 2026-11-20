import AnimatedLogo from "@/components/ui/logo/AnimatedLogo";
import { useIconColor } from "@/hooks/useIconColor";
import { useGetMeQuery } from "@/redux/api/authApi";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

const LOGO_SIZE = 96;

export default function IndexScreen() {
  const router = useRouter();
  const { accent } = useIconColor();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { isLoading } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)/feed");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
      <AnimatedLogo size={LOGO_SIZE} color={accent} />
    </View>
  );
}
