import type { PrivateQuestion } from "@/types/privateQuestionTypes";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PrivateQuestionCardProps {
  question: PrivateQuestion;
  mode: "inbox" | "sent";
  onPress: (id: string) => void; // ✅ router বাইরে, callback ভেতরে
  onStatusChange?: (id: string, status: "answered" | "ignored") => void;
}

const statusConfig = {
  pending: {
    label: "অপেক্ষমান",
    badgeClass: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-400",
  },
  answered: {
    label: "উত্তর দেওয়া হয়েছে",
    badgeClass: "bg-accent/10",
    textClass: "text-accent",
    dot: "bg-accent",
  },
  ignored: {
    label: "উপেক্ষা করা হয়েছে",
    badgeClass: "bg-red-100 dark:bg-red-900/30",
    textClass: "text-red-500 dark:text-red-400",
    dot: "bg-red-400",
  },
};

const Avatar = ({
  name,
  profileImage,
  isUnread,
}: {
  name: string;
  profileImage?: string;
  isUnread: boolean;
}) => (
  <View className="relative">
    <View className="w-11 h-11 rounded-full overflow-hidden border border-border dark:border-dark-border">
      {profileImage ? (
        <Image
          source={{ uri: profileImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-accent/20 items-center justify-center">
          <Text className="text-base font-bold text-accent uppercase">
            {name?.charAt(0)}
          </Text>
        </View>
      )}
    </View>
    {isUnread && (
      <View className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-background dark:border-dark-background" />
    )}
  </View>
);

const PrivateQuestionCard: React.FC<PrivateQuestionCardProps> = ({
  question,
  mode,
  onPress,
  onStatusChange,
}) => {
  const config = statusConfig[question.status];
  const otherUser = mode === "inbox" ? question.senderId : question.receiverId;
  const isUnread = mode === "inbox" && !question.isRead;

  return (
    <TouchableOpacity
      onPress={() => onPress(question._id)} // ✅ parent থেকে আসা callback
      activeOpacity={0.72}
      className={`mx-4 mb-3 rounded-2xl border p-4 ${
        isUnread
          ? "border-accent/30 bg-accent/5 dark:bg-accent/10"
          : "border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
      }`}
    >
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <Avatar
            name={otherUser.name}
            profileImage={otherUser.profileImage}
            isUnread={isUnread}
          />
          <View className="flex-1">
            <Text
              className="text-sm font-semibold text-text dark:text-dark-text"
              numberOfLines={1}
            >
              {otherUser.name}
            </Text>
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              @{otherUser.username}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View
          className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${config.badgeClass}`}
        >
          <View className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <Text className={`text-xs font-medium ${config.textClass}`}>
            {config.label}
          </Text>
        </View>
      </View>

      {/* ── Question text ── */}
      <View className="mb-3 pl-1">
        <Text
          className="text-sm text-text dark:text-dark-text leading-relaxed"
          numberOfLines={3}
        >
          {question.questionText}
        </Text>
      </View>

      {/* ── Footer ── */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
          {new Date(question.createdAt).toLocaleDateString("bn-BD", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>

        {mode === "inbox" &&
          question.status === "pending" &&
          onStatusChange && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onStatusChange(question._id, "ignored");
                }}
                className="px-3 py-1.5 rounded-full border border-border dark:border-dark-border"
              >
                <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                  উপেক্ষা
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onPress(question._id); // ✅ একই callback
                }}
                className="px-3 py-1.5 rounded-full bg-accent"
              >
                <Text className="text-xs font-semibold text-white">
                  উত্তর দাও
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    </TouchableOpacity>
  );
};

export default PrivateQuestionCard;
