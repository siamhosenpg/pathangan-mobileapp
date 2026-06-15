import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const isInbox = activeTab === "inbox";
  const isSent = activeTab === "sent";

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-background dark:bg-dark-background "
    >
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
          প্রশ্নসমূহ
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
          className={`flex-1 flex-row items-center justify-center py-2 rounded-lg gap-1 ${
            isInbox ? "bg-background dark:bg-dark-background shadow-sm" : ""
          }`}
        >
          <Ionicons
            name={isInbox ? "mail" : "mail-outline"}
            size={16}
            color={isInbox ? "#00914d" : isDark ? "#aaa" : "#666"}
          />

          <Text
            className={`text-sm font-medium ${
              isInbox
                ? "text-accent"
                : "text-text-tertiary dark:text-dark-text-tertiary"
            }`}
          >
            ইনবক্স
          </Text>
        </TouchableOpacity>

        {/* SENT */}
        <TouchableOpacity
          onPress={() => onTabChange("sent")}
          activeOpacity={0.8}
          className={`flex-1 flex-row items-center justify-center py-2 rounded-lg gap-1 ${
            isSent ? "bg-background dark:bg-dark-background shadow-sm" : ""
          }`}
        >
          <Ionicons
            name={isSent ? "send" : "send-outline"}
            size={16}
            color={isSent ? "#00914d" : isDark ? "#aaa" : "#666"}
          />

          <Text
            className={`text-sm font-medium ${
              isSent
                ? "text-accent"
                : "text-text-tertiary dark:text-dark-text-tertiary"
            }`}
          >
            পাঠানো
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PrivateQuestionHeader;
