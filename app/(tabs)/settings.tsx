import GreenMark from "@/components/ui/badges/GreenMark";
import LanguageSwitcher from "@/components/ui/setting/LanguageSwitcher";
import SettingsCard from "@/components/ui/setting/SettingsCard";
import SettingsRow from "@/components/ui/setting/SettingsRow";
import VideoAutoplay from "@/components/ui/setting/VideoAutoplay";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Prosongo brand color
  const accent = "#00914d";

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {/* ── Header ── */}
      <View className="flex-row items-center gap-3 px-5 pt-14 pb-3 border-b border-border dark:border-dark-border">
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
          {t("settings")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Profile Card ── */}
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          activeOpacity={0.7}
          className="flex-row items-center gap-4 mx-5 mt-5 mb-5 p-4 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border"
        >
          <View className="w-16 h-16 rounded-full border border-border dark:border-dark-border overflow-hidden bg-accent/20">
            {currentUser?.profileImage ? (
              <Image
                source={{ uri: currentUser.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-accent-secondary">
                <Text className="text-4xl font-bold text-accent uppercase mt-1">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-semibold text-text dark:text-dark-text">
                {currentUser?.name || "Shium Hossen"}
              </Text>
              <GreenMark mark={!!currentUser?.greenmarkVerified} size={16} />
            </View>

            <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary mt-[2px]">
              @{currentUser?.username || "shium"}
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full border border-accent">
            <Text className="text-xs text-accent font-medium">{t("edit")}</Text>
          </View>
        </TouchableOpacity>

        {/* ── Account Section ── */}
        <View className="px-5">
          <Text className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary tracking-widest uppercase mb-2">
            {t("account")}
          </Text>
          <SettingsCard>
            <SettingsRow
              icon="person-outline"
              iconBg={isDark ? "#09330946" : "#e8f5ee"}
              iconColor={accent}
              title={t("profileInfo")}
              subtitle={t("profileInfoSub")}
              onPress={() => router.push("/edit-profile")}
            />
            <SettingsRow
              icon="lock-closed-outline"
              iconBg={isDark ? "#1a2a3a" : "#e8f0f8"}
              iconColor="#5b9fd4"
              title={t("password")}
              subtitle={t("passwordSub")}
              onPress={() => router.push("/change-password")}
            />
            <SettingsRow
              icon="notifications-outline"
              iconBg={isDark ? "#2e2510" : "#fdf6e8"}
              iconColor="#e09c2a"
              title={t("notifications")}
              subtitle={t("notificationsSub")}
              right={
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ false: "#dddddd", true: accent }}
                  thumbColor="white"
                />
              }
            />
          </SettingsCard>
        </View>

        {/* ── App Section ── */}
        <View className="px-5">
          <Text className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary tracking-widest uppercase mb-2">
            {t("appSettings")}
          </Text>
          <SettingsCard>
            <SettingsRow
              icon="language-outline"
              iconBg={isDark ? "#1e1a2e" : "#f0eeff"}
              iconColor="#9b7fd4"
              title={t("language")}
              subtitle="Language"
              right={<LanguageSwitcher />}
            />
            <SettingsRow
              icon="moon-outline"
              iconBg={isDark ? "#1a1a2e" : "#f0eeff"}
              iconColor="#9b7fd4"
              title={t("darkMode")}
              subtitle={isDark ? t("on") : t("off")}
              right={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#dddddd", true: accent }}
                  thumbColor="white"
                />
              }
            />
            <SettingsRow
              icon="shield-outline"
              iconBg={isDark ? "#09330946" : "#e8f5ee"}
              iconColor={accent}
              title={t("privacy")}
              subtitle={t("privacySub")}
              onPress={() => router.push("/privacy")}
            />
          </SettingsCard>
        </View>
        <View className="px-5 pb-4">
          <VideoAutoplay />
        </View>

        {/* ── More Section ── */}
        <View className="px-5">
          <Text className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary tracking-widest uppercase mb-2">
            {t("more")}
          </Text>
          <SettingsCard>
            <SettingsRow
              icon="help-circle-outline"
              iconBg={isDark ? "#1a2a1a" : "#eaf5ea"}
              iconColor="#5cb85c"
              title={t("helpSupport")}
              onPress={() => router.push("/help")}
            />
            <SettingsRow
              icon="information-circle-outline"
              iconBg={isDark ? "#1a1a1a" : "#f5f5f5"}
              iconColor="#8a8a8a"
              title={t("about")}
              onPress={() => router.push("/about")}
            />
            <SettingsRow
              icon="log-out-outline"
              iconBg={isDark ? "#2e1a1a" : "#fff0f0"}
              iconColor="#f87171"
              title={t("logout")}
              titleClass="text-red-400"
              onPress={() => {
                /* logout logic */
              }}
            />
          </SettingsCard>
        </View>

        {/* ── Version ── */}
        <Text className="text-center text-xs text-text-tertiary dark:text-dark-text-tertiary mt-2">
          প্রসঙ্গ v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
