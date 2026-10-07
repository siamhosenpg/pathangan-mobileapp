import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Privacy = "public" | "friends" | "private";

interface Props {
  value: Privacy;
  onChange: (v: Privacy) => void;
  isDark: boolean;
}

const ACCENT = "#00914d";

const options: {
  value: Privacy;
  labelKey: string;
  descKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "public",
    labelKey: "privacyPublic",
    descKey: "privacyPublicDesc",
    icon: "earth-outline",
  },
  {
    value: "friends",
    labelKey: "privacyFriends",
    descKey: "privacyFriendsDesc",
    icon: "people-outline",
  },
  {
    value: "private",
    labelKey: "privacyPrivate",
    descKey: "privacyPrivateDesc",
    icon: "lock-closed-outline",
  },
];

const PrivacySelector = ({ value, onChange, isDark }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const current = options.find((o) => o.value === value) ?? options[0];
  const mutedIcon = isDark ? "#9CA3AF" : "#6B7280";
  const radioOff = isDark ? "#52525b" : "#d4d4d8";

  const handleOpen = () => {
    Keyboard.dismiss();
    setOpen(true);
  };

  const handleSelect = (v: Privacy) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <>
      {/* ───────── Select pill ───────── */}
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("postData.privacyTitle")}
        className="self-start flex-row items-center gap-1.5   "
      >
        <Ionicons name={current.icon} size={13} color={mutedIcon} />
        <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
          {t(`postData.${current.labelKey}`)}
        </Text>
        <Ionicons name="chevron-down" size={12} color={mutedIcon} />
      </TouchableOpacity>

      {/* ───────── Bottom sheet ───────── */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-end">
          {/* backdrop */}
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.5)" },
            ]}
            onPress={() => setOpen(false)}
          />

          <View
            className="bg-background dark:bg-dark-background rounded-t-3xl px-4 pt-2"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
          >
            {/* grabber */}
            <View className="self-center w-10 h-1 rounded-full bg-border dark:bg-dark-border mb-3" />

            <Text className="text-lg font-bold text-text dark:text-dark-text px-2 mb-2">
              {t("postData.privacyTitle")}
            </Text>

            {options.map((opt) => {
              const active = value === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  className="flex-row items-center gap-3 px-2 py-3 rounded-2xl"
                >
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center ${
                      active
                        ? "bg-accent/10"
                        : "bg-background-secondary dark:bg-dark-background-secondary"
                    }`}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={active ? ACCENT : mutedIcon}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-semibold text-text dark:text-dark-text">
                      {t(`postData.${opt.labelKey}`)}
                    </Text>
                    <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                      {t(`postData.${opt.descKey}`)}
                    </Text>
                  </View>

                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={active ? ACCENT : radioOff}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PrivacySelector;
