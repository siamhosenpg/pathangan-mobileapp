import GuestGuard from "@/components/ui/guard/GuestGuard";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <GuestGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </GuestGuard>
  );
}
