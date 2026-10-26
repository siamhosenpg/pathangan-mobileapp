import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useGetMeQuery, useRegisterMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
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
import Checkbox from "../layout/terms/Checkbox";
import { TermsSheet } from "../layout/terms/TermsContent";
import AuthHeader from "./auth/AuthHeader";
import AuthInput from "./auth/AuthInput";
import GoogleLoginButton from "./buttons/GoogleLoginButton";

// নাম ফিল্ডের আইকন (মানুষের মাথা-কাঁধ)
import UserIcon from "@/assets/icons/user.svg";
// ইমেইল ফিল্ডের আইকন (খামের মতো)
import MailIcon from "@/assets/icons/envelope.svg";
// পাসওয়ার্ড ফিল্ডের আইকন (তালা)
import LockIcon from "@/assets/icons/lock.svg";
// error বক্সের আইকন (গোল, ভেতরে ! চিহ্ন)
import AlertCircleIcon from "@/assets/icons/diamond-exclamation.svg";
// রেজিস্ট্রেশন বাটনের ডান পাশের তীর
import ArrowRightIcon from "@/assets/icons/angle-small-right.svg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
};

type Props = {
  onSwitch: () => void; // Login ফর্মে যাওয়ার জন্য
};

// পাসওয়ার্ড কতটা শক্ত (০–৩)
const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw)) score++;
  if (pw.length >= 10 && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

// label এখানে নেই, নিচে t() দিয়ে নেওয়া হয়
const STRENGTH_COLORS = [
  "bg-border dark:bg-dark-border",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
];
const STRENGTH_KEYS = ["", "strengthWeak", "strengthFair", "strengthStrong"];

export default function RegisterForm({ onSwitch }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { refetch } = useGetMeQuery();
  const { open } = useBottomSheet();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const strength = getStrength(form.password);

  const clearError = (key: keyof FieldErrors) => {
    if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const errors: FieldErrors = {};
    if (form.name.trim().length < 2)
      errors.name = t("authData.validation.nameRequired");
    if (!form.email.trim())
      errors.email = t("authData.validation.emailRequired");
    else if (!EMAIL_REGEX.test(form.email.trim()))
      errors.email = t("authData.validation.emailInvalid");
    if (form.password.length < 6)
      errors.password = t("authData.validation.passwordShort");
    if (!agreed) errors.terms = t("authData.validation.termsRequired");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validate()) return;

    try {
      const res = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        termsAccepted: true,
      }).unwrap();
      dispatch(setUser(res.user));
      await refetch();
      router.replace("/(tabs)/feed");
    } catch (err: any) {
      if (err?.status === "FETCH_ERROR")
        setServerError(t("authData.errors.network"));
      else if (err?.status === 409)
        setServerError(t("authData.errors.emailInUse"));
      else setServerError(t("authData.errors.generic"));
    }
  };

  const openTerms = () => open(<TermsSheet />);

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
              title={t("authData.register.title")}
              subtitle={t("authData.register.subtitle")}
            />

            {serverError && (
              <View className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-5 flex-row items-center gap-2">
                <AlertCircleIcon width={18} height={18} color="#f87171" />
                <Text className="text-red-400 text-sm flex-1">
                  {serverError}
                </Text>
              </View>
            )}

            <View className="mb-5">
              <GoogleLoginButton />
            </View>

            <View className="flex-row items-center gap-3 mb-6">
              <View className="flex-1 h-px bg-border dark:bg-dark-border" />
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                {t("authData.register.orEmail")}
              </Text>
              <View className="flex-1 h-px bg-border dark:bg-dark-border" />
            </View>

            <AuthInput
              label={t("authData.register.nameLabel")}
              icon={UserIcon}
              value={form.name}
              onChangeText={(val) => {
                setForm((p) => ({ ...p, name: val }));
                clearError("name");
              }}
              placeholder={t("authData.register.namePlaceholder")}
              error={fieldErrors.name}
            />

            <AuthInput
              label={t("authData.register.emailLabel")}
              icon={MailIcon}
              value={form.email}
              onChangeText={(val) => {
                setForm((p) => ({ ...p, email: val }));
                clearError("email");
              }}
              placeholder={t("authData.register.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors.email}
            />

            <AuthInput
              label={t("authData.register.passwordLabel")}
              icon={LockIcon}
              isPassword
              value={form.password}
              onChangeText={(val) => {
                setForm((p) => ({ ...p, password: val }));
                clearError("password");
              }}
              placeholder={t("authData.register.passwordPlaceholder")}
              autoCapitalize="none"
              error={fieldErrors.password}
            />

            {/* পাসওয়ার্ড strength */}
            {form.password.length > 0 && (
              <View className="-mt-1 mb-4">
                <View className="flex-row gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className={`flex-1 h-1 rounded-full ${
                        strength >= i
                          ? STRENGTH_COLORS[strength]
                          : "bg-border dark:bg-dark-border"
                      }`}
                    />
                  ))}
                </View>
                {strength > 0 && (
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-1.5">
                    {t("authData.register.strengthText", {
                      label: t(`authData.register.${STRENGTH_KEYS[strength]}`),
                    })}
                  </Text>
                )}
              </View>
            )}

            {/* Terms checkbox */}
            <View className="mb-5 mt-1">
              <View className="flex-row items-start gap-3">
                <Checkbox
                  checked={agreed}
                  hasError={!!fieldErrors.terms}
                  onChange={(v) => {
                    setAgreed(v);
                    clearError("terms");
                  }}
                />
                <Text className="flex-1 text-text-secondary dark:text-dark-text-secondary text-[13px] leading-5">
                  {t("authData.register.termsPrefix")}{" "}
                  <Text
                    onPress={openTerms}
                    className="text-accent font-semibold"
                  >
                    {t("authData.register.termsLink")}
                  </Text>
                  {t("authData.register.termsSuffix")}
                </Text>
              </View>
              {fieldErrors.terms ? (
                <Text className="text-red-400 text-xs mt-2 ml-9">
                  {fieldErrors.terms}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !agreed}
              activeOpacity={0.85}
              className="w-full h-[52px] rounded-2xl bg-accent items-center justify-center flex-row gap-2 mb-6"
              style={{ opacity: isLoading || !agreed ? 0.45 : 1 }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold text-sm">
                    {t("authData.register.submitting")}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-semibold text-[15px]">
                    {t("authData.register.submit")}
                  </Text>
                  <ArrowRightIcon width={18} height={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
                {t("authData.register.haveAccount")}
              </Text>
              <TouchableOpacity onPress={onSwitch}>
                <Text className="text-accent font-semibold text-sm">
                  {t("authData.register.loginLink")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
