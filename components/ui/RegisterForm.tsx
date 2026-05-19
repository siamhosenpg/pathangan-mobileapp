import { useGetMeQuery, useRegisterMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";

import type { RegisterRequest } from "@/types/authTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
      className="flex-1 bg-gray-950"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Google Alert Modal */}
      <Modal visible={googleAlert} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-4">
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                <Text className="text-lg">G</Text>
              </View>
              <View>
                <Text className="text-white font-semibold text-sm">
                  Google লগইন শীঘ্রই আসছে
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  Coming Soon
                </Text>
              </View>
            </View>
            <Text className="text-gray-400 text-sm leading-6 mb-4">
              আমরা শীঘ্রই Google-এর সাথে সংযোগ স্থাপন করব। এর মধ্যে ইমেইল দিয়ে
              রেজিস্ট্রেশন করুন।
            </Text>
            <TouchableOpacity
              onPress={() => setGoogleAlert(false)}
              className="bg-indigo-600 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-sm">বুঝেছি</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="flex-1 px-6 py-12 items-center justify-center">
        <View className="w-full max-w-md">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
              <Text className="text-white font-bold text-2xl">প</Text>
            </View>
            <Text className="text-3xl font-bold text-white mb-1">
              অ্যাকাউন্ট খুলুন ✨
            </Text>
            <Text className="text-gray-400 text-sm">
              নিচের তথ্যগুলো পূরণ করুন
            </Text>
          </View>

          {/* Error */}
          {errorMessage && (
            <View className="bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl mb-4">
              <Text className="text-red-400 text-sm">⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* Google Button */}
          <TouchableOpacity
            onPress={() => setGoogleAlert(true)}
            className="w-full flex-row items-center justify-center gap-3 py-4 rounded-xl border border-gray-700 bg-white/5 mb-5"
          >
            <Text className="text-white text-sm font-medium">
              Google দিয়ে রেজিস্ট্রেশন করুন
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="flex-1 h-px bg-gray-800" />
            <Text className="text-gray-500 text-xs">অথবা ইমেইল দিয়ে</Text>
            <View className="flex-1 h-px bg-gray-800" />
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">পুরো নাম</Text>
            <View className="flex-row items-center bg-white/5 border border-gray-700 rounded-xl px-4 gap-3">
              <Ionicons name="person-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={form.name}
                onChangeText={(val) => setForm((p) => ({ ...p, name: val }))}
                placeholder="আপনার পুরো নাম লিখুন"
                placeholderTextColor="#6B7280"
                className="flex-1 py-4 text-white text-sm"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">ইমেইল</Text>
            <View className="flex-row items-center bg-white/5 border border-gray-700 rounded-xl px-4 gap-3">
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={form.email}
                onChangeText={(val) => setForm((p) => ({ ...p, email: val }))}
                placeholder="আপনার ইমেইল লিখুন"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 py-4 text-white text-sm"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-white text-sm mb-2">পাসওয়ার্ড</Text>
            <View className="flex-row items-center bg-white/5 border border-gray-700 rounded-xl px-4 gap-3">
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={form.password}
                onChangeText={(val) =>
                  setForm((p) => ({ ...p, password: val }))
                }
                placeholder="কমপক্ষে ৬ অক্ষর"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                className="flex-1 py-4 text-white text-sm"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-indigo-600 items-center mb-6"
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-sm">
                  অ্যাকাউন্ট তৈরি হচ্ছে...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-sm">
                রেজিস্ট্রেশন করুন
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-400 text-sm">
              আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-purple-400 font-medium text-sm">
                লগইন করুন
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
