import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  unreadCount?: number;
  activeTab: "inbox" | "sent";
  onTabChange: (tab: "inbox" | "sent") => void;
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
  const isInbox = activeTab === "inbox";
  const isSent = activeTab === "sent";

  const activeColor = "#00914d";
  const inactiveColor = isDark ? "#8a8a8a" : "#6d6d6d";

  // সক্রিয় ট্যাবের shadow
  const activeTabStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  };

  // নিষ্ক্রিয় ট্যাবে background সরানো হচ্ছে
  const inactiveTabStyle = {
    backgroundColor: "transparent",
  };

  return (
    <View className="bg-background dark:bg-dark-background">
      {/* ── TOP BAR ── */}
      <View className="px-4 pt-3 pb-2 flex-row items-center mb-3">
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
          {t("questions")}
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
      <View className="flex-row bg-background-secondary dark:bg-dark-background-secondary p-1 rounded-xl mx-4 mb-2">
        {/* INBOX */}
        <TouchableOpacity
          onPress={() => onTabChange("inbox")}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center py-2 rounded-lg gap-1 bg-background dark:bg-dark-background"
          style={isInbox ? activeTabStyle : inactiveTabStyle}
        >
          <Ionicons
            name={isInbox ? "mail" : "mail-outline"}
            size={16}
            color={isInbox ? activeColor : inactiveColor}
          />

          <Text
            className="text-sm font-medium"
            style={{ color: isInbox ? activeColor : inactiveColor }}
          >
            {t("inbox")}
          </Text>
        </TouchableOpacity>

        {/* SENT */}
        <TouchableOpacity
          onPress={() => onTabChange("sent")}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center py-2 rounded-lg gap-1 bg-background dark:bg-dark-background"
          style={isSent ? activeTabStyle : inactiveTabStyle}
        >
          <Ionicons
            name={isSent ? "send" : "send-outline"}
            size={16}
            color={isSent ? activeColor : inactiveColor}
          />

          <Text
            className="text-sm font-medium"
            style={{ color: isSent ? activeColor : inactiveColor }}
          >
            {t("sent")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PrivateQuestionHeader;
