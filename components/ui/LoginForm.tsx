import { useGetMeQuery, useLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { LoginRequest } from "@/types/authTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import GoogleLoginButton from "./buttons/GoogleLoginButton";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { refetch } = useGetMeQuery();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [googleAlert, setGoogleAlert] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoginError(null);
    try {
      const res = await login(form).unwrap();
      dispatch(setUser(res.user));
      await refetch();
      router.replace("/(tabs)/feed");
    } catch (err: any) {
      if (err?.data?.message) {
        setLoginError(err.data.message);
      } else if (err?.status === "FETCH_ERROR") {
        setLoginError("সার্ভারের সাথে সংযোগ হচ্ছে না। একটু পরে চেষ্টা করুন।");
      } else if (err?.status === 401) {
        setLoginError("ইমেইল বা পাসওয়ার্ড ভুল।");
      } else {
        setLoginError("কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
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
              স্বাগতম
            </Text>
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
              আপনার অ্যাকাউন্টে প্রবেশ করুন
            </Text>
          </View>

          {/* Error */}
          {loginError && (
            <View className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mb-4 flex-row items-center gap-2">
              <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">{loginError}</Text>
            </View>
          )}

          {/* Google Button */}
          <View className="pb-4">
            <GoogleLoginButton />
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="flex-1 h-px bg-border dark:bg-dark-border" />
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
              অথবা ইমেইল দিয়ে
            </Text>
            <View className="flex-1 h-px bg-border dark:bg-dark-border" />
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
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs font-medium uppercase tracking-widest">
                পাসওয়ার্ড
              </Text>
              <Text className="text-accent text-xs">ভুলে গেছেন?</Text>
            </View>
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
                placeholder="আপনার পাসওয়ার্ড লিখুন"
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
                  লগইন হচ্ছে...
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white font-semibold text-sm">
                  লগইন করুন
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
              অ্যাকাউন্ট নেই?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-accent font-semibold text-xs">
                এখনই রেজিস্ট্রেশন করুন
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
