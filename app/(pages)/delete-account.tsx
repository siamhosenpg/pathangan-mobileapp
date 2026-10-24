import AlertCircleIcon from "@/assets/icons/diamond-exclamation.svg";
import LockIcon from "@/assets/icons/lock.svg";
import UserIcon from "@/assets/icons/user.svg";
// ⚠️ নিচের path আপনার AuthInput ফাইলের আসল path দিয়ে বদলান
import AuthInput from "@/components/ui/auth/AuthInput";
import { useTheme } from "@/hooks/useTheme";
import { useGetMeQuery } from "@/redux/api/authApi";
import { baseApi } from "@/redux/api/baseApi";
import { useDeleteUserMutation } from "@/redux/api/userApi";
import { clearUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { User } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUPPORT_EMAIL = "help@pathangan.com";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();
  const { data } = useGetMeQuery();
  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  const me = data?.user as unknown as User | undefined;
  // শুধু Google দিয়ে খোলা account এ পাসওয়ার্ড নেই, তাই username দিয়ে নিশ্চিত করবে
  const isGoogleOnly = me?.provider === "google";

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!me) return;

    try {
      await deleteUser({
        userid: me.userid,
        ...(isGoogleOnly ? { confirmText: value.trim() } : { password: value }),
      }).unwrap();

      // সফল: token মুছে, state ও cache পরিষ্কার করে login এ পাঠাও
      await SecureStore.deleteItemAsync("token");
      dispatch(clearUser());
      dispatch(baseApi.util.resetApiState());
      router.replace("/(auth)/login");

      Alert.alert(
        "অ্যাকাউন্ট ডিলিট হয়েছে",
        `কয়েকদিনের মধ্যে অ্যাকাউন্ট ফিরে পেতে চাইলে ${SUPPORT_EMAIL} এ মেইল করুন।`,
      );
    } catch (err: any) {
      if (err?.status === "FETCH_ERROR") {
        setError("ইন্টারনেট সংযোগ নেই। আবার চেষ্টা করুন।");
      } else if (
        (err?.status === 400 || err?.status === 403) &&
        err?.data?.message
      ) {
        setError(err.data.message);
      } else {
        setError("কিছু ভুল হয়েছে। একটু পরে আবার চেষ্টা করুন।");
      }
    }
  };

  const handleSubmit = () => {
    setError(null);

    if (!me) return;

    if (!value.trim()) {
      setError(isGoogleOnly ? "আপনার username লিখুন" : "পাসওয়ার্ড দিন");
      return;
    }

    Alert.alert(
      "অ্যাকাউন্ট ডিলিট করবেন?",
      "আপনার অ্যাকাউন্ট ও সব কনটেন্ট সবার কাছ থেকে লুকিয়ে যাবে এবং আপনি আর লগইন করতে পারবেন না।",
      [
        { text: "থাকুন", style: "cancel" },
        {
          text: "ডিলিট করুন",
          style: "destructive",
          onPress: confirmDelete,
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* ── Header ── */}
      <View className="flex-row items-center gap-3 px-5 pt-3 pb-3 border-b border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-text dark:text-dark-text">
          অ্যাকাউন্ট ডিলিট
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* ── সতর্কবার্তা ── */}
          <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="warning-outline" size={20} color="#f87171" />
              <Text className="text-red-400 font-semibold text-sm">
                এটি করার আগে জেনে নিন
              </Text>
            </View>
            <Text className="text-text-secondary dark:text-dark-text-secondary text-[13px] leading-5">
              • আপনার প্রোফাইল, পোস্ট, প্রশ্ন ও হ্যান্ডআউট কেউ দেখতে পারবে না।
              {"\n"}• আপনি আর এই অ্যাকাউন্টে লগইন করতে পারবেন না।
              {"\n"}• কয়েকদিন পর অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলা হবে।
              {"\n"}• এর মধ্যে ফিরে পেতে চাইলে আপনার অ্যাকাউন্টের ইমেইল থেকে
              নাম, username ও জন্ম তারিখ দিয়ে {SUPPORT_EMAIL} এ মেইল করুন।
            </Text>
          </View>

          {error && (
            <View className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-5 flex-row items-center gap-2">
              <AlertCircleIcon width={18} height={18} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
            </View>
          )}

          {/* ── নিশ্চিতকরণ ইনপুট ── */}
          {isGoogleOnly ? (
            <AuthInput
              label={`নিশ্চিত করতে আপনার username লিখুন (${me?.username ?? ""})`}
              icon={UserIcon}
              value={value}
              onChangeText={(val) => {
                setValue(val);
                if (error) setError(null);
              }}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <AuthInput
              label="পাসওয়ার্ড দিয়ে নিশ্চিত করুন"
              icon={LockIcon}
              isPassword
              value={value}
              onChangeText={(val) => {
                setValue(val);
                if (error) setError(null);
              }}
              placeholder="আপনার পাসওয়ার্ড"
              autoCapitalize="none"
            />
          )}

          {/* ── ডিলিট বাটন ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !me}
            activeOpacity={0.85}
            className="w-full h-[52px] rounded-2xl bg-red-500 items-center justify-center flex-row gap-2 mt-2"
            style={{ opacity: isLoading || !me ? 0.5 : 1 }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-sm">
                  ডিলিট হচ্ছে...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold text-[15px]">
                  অ্যাকাউন্ট ডিলিট করুন
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-full h-[48px] items-center justify-center mt-3"
          >
            <Text className="text-text-secondary dark:text-dark-text-secondary font-medium text-sm">
              বাতিল করুন
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
