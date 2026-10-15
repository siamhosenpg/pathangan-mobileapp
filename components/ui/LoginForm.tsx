import { useGetMeQuery, useLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { LoginRequest } from "@/types/authTypes";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthHeader from "./auth/AuthHeader";
import AuthInput from "./auth/AuthInput";
import GoogleLoginButton from "./buttons/GoogleLoginButton";

// ইমেইল ফিল্ডের আইকন (খামের মতো)
import MailIcon from "@/assets/icons/envelope.svg";
// পাসওয়ার্ড ফিল্ডের আইকন (তালা)
import LockIcon from "@/assets/icons/lock.svg";
// error বক্সের আইকন (গোল, ভেতরে ! চিহ্ন)
import AlertCircleIcon from "@/assets/icons/diamond-exclamation.svg";
// লগইন বাটনের ডান পাশের তীর
import ArrowRightIcon from "@/assets/icons/angle-small-right.svg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { refetch } = useGetMeQuery();

  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!form.email.trim())
      errors.email = t("authData.validation.emailRequired");
    else if (!EMAIL_REGEX.test(form.email.trim()))
      errors.email = t("authData.validation.emailInvalid");
    if (!form.password)
      errors.password = t("authData.validation.passwordRequired");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setLoginError(null);
    if (!validate()) return;

    try {
      const res = await login({
        ...form,
        email: form.email.trim(),
      }).unwrap();
      dispatch(setUser(res.user));
      await refetch();
      router.replace("/(tabs)/feed");
    } catch (err: any) {
      if (err?.status === "FETCH_ERROR") {
        setLoginError(t("authData.errors.network"));
      } else if (err?.status === 401) {
        setLoginError(t("authData.errors.invalidCredentials"));
      } else if (err?.status === 403 && err?.data?.message) {
        // suspended / banned ইত্যাদির বার্তা backend থেকে আসে
        setLoginError(err.data.message);
      } else {
        setLoginError(t("authData.errors.generic"));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-10 justify-center">
          <View className="w-full max-w-md self-center">
            <AuthHeader
              title={t("authData.login.title")}
              subtitle={t("authData.login.subtitle")}
            />

            {loginError && (
              <View className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-5 flex-row items-center gap-2">
                <AlertCircleIcon width={18} height={18} color="#f87171" />
                <Text className="text-red-400 text-sm flex-1">
                  {loginError}
                </Text>
              </View>
            )}

            <View className="mb-5">
              <GoogleLoginButton />
            </View>

            <View className="flex-row items-center gap-3 mb-6">
              <View className="flex-1 h-px bg-border dark:bg-dark-border" />
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                {t("authData.login.orEmail")}
              </Text>
              <View className="flex-1 h-px bg-border dark:bg-dark-border" />
            </View>

            <AuthInput
              label={t("authData.login.emailLabel")}
              icon={MailIcon}
              value={form.email}
              onChangeText={(val) => {
                setForm((p) => ({ ...p, email: val }));
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder={t("authData.login.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors.email}
            />

            <AuthInput
              label={t("authData.login.passwordLabel")}
              icon={LockIcon}
              isPassword
              value={form.password}
              onChangeText={(val) => {
                setForm((p) => ({ ...p, password: val }));
                if (fieldErrors.password)
                  setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder={t("authData.login.passwordPlaceholder")}
              autoCapitalize="none"
              error={fieldErrors.password}
              rightLabel={
                <Text className="text-accent text-xs font-medium">
                  {t("authData.login.forgotPassword")}
                </Text>
              }
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
              className="w-full h-[52px] rounded-2xl bg-accent items-center justify-center flex-row gap-2 mt-2 mb-6"
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold text-sm">
                    {t("authData.login.submitting")}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-semibold text-[15px]">
                    {t("authData.login.submit")}
                  </Text>
                  <ArrowRightIcon width={18} height={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm font-medium">
                {t("authData.login.noAccount")}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-accent font-semibold text-sm">
                  {t("authData.login.registerLink")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
