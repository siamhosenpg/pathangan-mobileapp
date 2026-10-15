import { useGetMeQuery } from "@/redux/api/authApi";
import { useAcceptTermsMutation } from "@/redux/api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Checkbox from "./Checkbox";
import { TermsBody } from "./TermsContent";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function TermsGate() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isFetching, refetch } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [acceptTerms, { isLoading: saving }] = useAcceptTermsMutation();

  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = data?.user;

  // শুধু যখন নিশ্চিত false তখনই দেখাবে (undefined হলে অ্যাপ আটকাবে না)
  const visible =
    !isLoading && !isFetching && !!user && user.termsUpToDate === false;

  const handleAgree = async () => {
    if (!checked) return;
    setError(null);
    try {
      await acceptTerms().unwrap();
      await refetch();
    } catch {
      setError(t("authData.errors.generic"));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      // Android back button চাপলে কিছুই হবে না
      onRequestClose={() => {}}
    >
      <View className="flex-1 justify-end bg-black/70">
        <View
          className="bg-background dark:bg-dark-background rounded-t-3xl"
          style={{
            maxHeight: SCREEN_HEIGHT * 0.9,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View className="w-14 h-1.5 bg-border dark:bg-dark-border rounded-full self-center mt-3 mb-4" />

          <View className="px-5 flex-row items-center gap-3 mb-4">
            <View className="w-11 h-11 rounded-xl bg-accent/15 items-center justify-center">
              <Ionicons name="shield-checkmark" size={22} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-text dark:text-dark-text text-lg font-semibold">
                {t("authData.gate.title")}
              </Text>
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-0.5">
                {t("authData.gate.subtitle")}
              </Text>
            </View>
          </View>

          <View className="h-px bg-border dark:bg-dark-border" />

          <ScrollView
            style={{ flexGrow: 0 }}
            className="px-5 pt-4"
            showsVerticalScrollIndicator
            bounces={false}
          >
            <TermsBody />
          </ScrollView>

          <View className="h-px bg-border dark:bg-dark-border" />

          <View className="px-5 pt-4">
            {error && (
              <View className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mb-3 flex-row items-center gap-2">
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#f87171"
                />
                <Text className="text-red-400 text-sm flex-1">{error}</Text>
              </View>
            )}

            <View className="flex-row items-start gap-3 mb-4">
              <Checkbox checked={checked} onChange={setChecked} />
              <Text className="flex-1 text-text dark:text-dark-text text-[13px] leading-5">
                {t("authData.gate.agreeText")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAgree}
              disabled={!checked || saving}
              activeOpacity={0.8}
              className="w-full h-12 rounded-xl bg-accent items-center justify-center flex-row gap-2"
              style={{ opacity: !checked || saving ? 0.45 : 1 }}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold text-sm">
                    {t("authData.gate.saving")}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-semibold ">
                    {t("authData.gate.agreeButton")}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
