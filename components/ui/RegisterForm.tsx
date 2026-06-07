import { useGetMeQuery, useRegisterMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { RegisterRequest } from "@/types/authTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();
  const { refetch } = useGetMeQuery();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [form, setForm] = useState<Omit<RegisterRequest, "username">>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [googleAlert, setGoogleAlert] = useState(false);

  const handleSubmit = async () => {
    try {
      const res = await register(form).unwrap();
      dispatch(setUser(res.user));
      await refetch();
      router.replace("/(tabs)/feed");
    } catch {}
  };

  const errorMessage =
    error && "data" in error
      ? (error.data as { message: string })?.message
      : null;

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Google Coming Soon Modal */}
      <Modal visible={googleAlert} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-full bg-background-tertiary dark:bg-dark-background-tertiary items-center justify-center">
                <Text className="text-base font-bold text-text dark:text-dark-text">
                  G
                </Text>
              </View>
              <View>
                <Text className="text-text dark:text-dark-text font-semibold text-sm">
                  Google লগইন শীঘ্রই আসছে
                </Text>
                <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-0.5">
                  Coming Soon
                </Text>
              </View>
            </View>
            <Text className="text-text-secondary dark:text-dark-text-secondary text-sm leading-6 mb-5">
              আমরা শীঘ্রই Google-এর সাথে সংযোগ স্থাপন করব। এর মধ্যে ইমেইল দিয়ে
              রেজিস্ট্রেশন করুন।
            </Text>
            <TouchableOpacity
              onPress={() => setGoogleAlert(false)}
              className="bg-accent py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-sm">বুঝেছি</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="flex-1 px-6 justify-center">
        <View className="w-full max-w-md self-center">
          {/* Logo & Header */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-2xl bg-accent items-center justify-center mb-4">
              <Text
                className="text-white font-bold text-2xl"
                style={{ fontFamily: "serif" }}
              >
                প
              </Text>
            </View>
            <Text className="text-2xl font-semibold text-text dark:text-dark-text mb-1 tracking-tight">
              অ্যাকাউন্ট খুলুন
            </Text>
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
              নিচের তথ্যগুলো পূরণ করুন
            </Text>
          </View>

          {/* Error */}
          {errorMessage && (
            <View className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mb-4 flex-row items-center gap-2">
              <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Google Button */}
          <TouchableOpacity
            onPress={() => setGoogleAlert(true)}
            className="w-full flex-row items-center justify-center gap-3 py-3.5 rounded-xl bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border mb-5"
            activeOpacity={0.7}
          >
            <Text className="text-lg">G</Text>
            <Text className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium">
              Google দিয়ে রেজিস্ট্রেশন করুন
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="flex-1 h-px bg-border dark:bg-dark-border" />
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
              অথবা ইমেইল দিয়ে
            </Text>
            <View className="flex-1 h-px bg-border dark:bg-dark-border" />
          </View>

          {/* Name Field */}
          <View className="mb-3">
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs font-medium uppercase tracking-widest mb-2">
              পুরো নাম
            </Text>
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 gap-3 h-12">
              <Ionicons
                name="person-outline"
                size={16}
                color={isDark ? "#8a8a8a" : "#6d6d6d"}
              />
              <TextInput
                value={form.name}
                onChangeText={(val) => setForm((p) => ({ ...p, name: val }))}
                placeholder="আপনার পুরো নাম লিখুন"
                placeholderTextColor={isDark ? "#3a3a3a" : "#6d6d6d"}
                className="flex-1 text-text dark:text-dark-text text-sm"
              />
            </View>
          </View>

          {/* Email Field */}
          <View className="mb-3">
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs font-medium uppercase tracking-widest mb-2">
              ইমেইল
            </Text>
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 gap-3 h-12">
              <Ionicons
                name="mail-outline"
                size={16}
                color={isDark ? "#8a8a8a" : "#6d6d6d"}
              />
              <TextInput
                value={form.email}
                onChangeText={(val) => setForm((p) => ({ ...p, email: val }))}
                placeholder="আপনার ইমেইল লিখুন"
                placeholderTextColor={isDark ? "#3a3a3a" : "#6d6d6d"}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-text dark:text-dark-text text-sm"
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs font-medium uppercase tracking-widest mb-2">
              পাসওয়ার্ড
            </Text>
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 gap-3 h-12">
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={isDark ? "#8a8a8a" : "#6d6d6d"}
              />
              <TextInput
                value={form.password}
                onChangeText={(val) =>
                  setForm((p) => ({ ...p, password: val }))
                }
                placeholder="কমপক্ষে ৬ অক্ষর"
                placeholderTextColor={isDark ? "#3a3a3a" : "#6d6d6d"}
                secureTextEntry={!showPassword}
                className="flex-1 text-text dark:text-dark-text text-sm"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={16}
                  color={isDark ? "#8a8a8a" : "#6d6d6d"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
            className="w-full h-12 rounded-xl bg-accent items-center justify-center flex-row gap-2 mb-5"
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-sm">
                  অ্যাকাউন্ট তৈরি হচ্ছে...
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white font-semibold text-sm">
                  রেজিস্ট্রেশন করুন
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
              আগে থেকেই অ্যাকাউন্ট আছে?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-accent font-semibold text-xs">
                লগইন করুন
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
