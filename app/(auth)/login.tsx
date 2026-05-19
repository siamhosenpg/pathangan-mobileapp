import GuestGuard from "@/components/ui/guard/GuestGuard";
import LoginForm from "@/components/ui/LoginForm";

import { View } from "react-native";

export default function LoginPage() {
  return (
    <GuestGuard>
      <View className="flex-1">
        <LoginForm />
      </View>
    </GuestGuard>
  );
}
