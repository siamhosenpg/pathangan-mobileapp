import GuestGuard from "@/components/ui/guard/GuestGuard";
import RegisterForm from "@/components/ui/RegisterForm";

import { View } from "react-native";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <View className="flex-1">
        <RegisterForm />
      </View>
    </GuestGuard>
  );
}
