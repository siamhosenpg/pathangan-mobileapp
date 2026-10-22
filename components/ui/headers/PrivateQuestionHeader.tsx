import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type TabKey = "inbox" | "sent";

type Props = {
  unreadCount?: number;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onBack?: () => void;
};

const PrivateQuestionHeader = ({
  unreadCount = 0,
  activeTab,
  onTabChange,
  onBack,
}: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();

  const activeColor = "#00914d";
  const inactiveColor = isDark ? "#8a8a8a" : "#6d6d6d";
  const borderColor = isDark ? "#2a2a2a" : "#e5e5e5";

  const tabs: {
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconOutline: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      key: "inbox",
      label: t("privateData.inbox"),
      icon: "mail",
      iconOutline: "mail-outline",
    },
    {
      key: "sent",
      label: t("privateData.sent"),
      icon: "send",
      iconOutline: "send-outline",
    },
  ];

  return (
    <View className="bg-background dark:bg-dark-background">
      {/* ── TOP BAR ── */}
      <View className="px-4 pt-3 pb-2 flex-row items-center">
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="w-9 h-9 mr-3 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>

        {/* TITLE */}
        <Text className="text-lg font-bold text-text dark:text-dark-text flex-1">
          {t("privateData.questions")}
        </Text>

        {/* UNREAD BADGE */}
        {unreadCount > 0 && (
          <View className="px-2.5 py-1 rounded-full bg-accent">
            <Text className="text-xs font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* ── TABS ── */}
      <View
        className="flex-row"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center py-3 gap-1.5"
              style={{
                borderBottomWidth: 2,
                borderBottomColor: isActive ? activeColor : "transparent",
                marginBottom: -1,
              }}
            >
              <Ionicons
                name={isActive ? tab.icon : tab.iconOutline}
                size={16}
                color={isActive ? activeColor : inactiveColor}
              />

              <Text
                className=" font-semibold "
                style={{
                  color: isActive ? activeColor : inactiveColor,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PrivateQuestionHeader;
