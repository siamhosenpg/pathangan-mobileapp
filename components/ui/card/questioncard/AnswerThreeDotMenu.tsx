import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useDeleteAnswerMutation } from "@/redux/api/answer/answersApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnswerPopupContent from "./AnswerPopupContent";

interface Props {
  answerId: string;
  answerAuthorId: string;
  questionId: string;
  questionText: string;
  answerText: string;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}

const AnswerThreeDotMenu = ({
  answerId,
  answerAuthorId,
  questionId,
  questionText,
  answerText,
}: Props) => {
  const { close, open } = useBottomSheet();
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);

  const isOwnAnswer =
    currentUser?.id === answerAuthorId ||
    (currentUser as any)?._id === answerAuthorId;

  const [deleteAnswer, { isLoading: isDeleting }] = useDeleteAnswerMutation();

  const handleCopyLink = () => {
    close();
  };

  // menu বন্ধ করে edit popup খোলা
  const handleEditAnswer = () => {
    close();
    // bottom sheet এর close animation শেষ হওয়ার জন্য একটু অপেক্ষা
    setTimeout(() => {
      open(
        <AnswerPopupContent
          questionId={questionId}
          questionText={questionText}
          answerId={answerId}
          initialText={answerText}
        />,
      );
    }, 300);
  };

  const handleDeleteAnswer = () => {
    Alert.alert(
      t("answerData.deleteAnswer"),
      t("answerData.deleteAnswerConfirm"),
      [
        { text: t("answerData.cancel"), style: "cancel" },
        {
          text: t("answerData.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnswer({ answerId, questionId }).unwrap();
              close();
              if (router.canGoBack()) router.back();
            } catch {
              Alert.alert(t("answerData.somethingWentWrong"));
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const menuItems: MenuItem[] = [];

  if (isOwnAnswer) {
    menuItems.push({
      icon: "create-outline",
      title: t("answerData.editAnswer"),
      subtitle: t("answerData.editAnswerSub"),
      onPress: handleEditAnswer,
    });
  }

  menuItems.push(
    {
      icon: "link-outline",
      title: t("answerData.copyLink"),
      subtitle: t("answerData.copyLinkSub"),
      onPress: handleCopyLink,
    },
    {
      icon: "flag-outline",
      title: t("answerData.reportAnswer"),
      subtitle: t("answerData.reportAnswerSub"),
      onPress: close,
    },
  );

  if (isOwnAnswer) {
    menuItems.push({
      icon: "trash-outline",
      title: t("answerData.deleteAnswer"),
      subtitle: t("answerData.deleteAnswerSub"),
      onPress: handleDeleteAnswer,
      danger: true,
    });
  }

  return (
    <View className="px-3 pt-1 pb-2">
      {/* Header */}
      <View className="px-4 py-3 mb-1 border-b border-border dark:border-dark-border flex-row items-center justify-between">
        <Text className="text-base font-bold text-text dark:text-dark-text">
          {t("answerData.answerOptions")}
        </Text>
        <View className="w-9 h-1 rounded-full bg-border dark:bg-dark-border opacity-0" />
      </View>

      {/* Menu Items */}
      <View className="pt-2">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.danger && (
              <View className="h-px bg-border dark:bg-dark-border my-2 mx-1" />
            )}
            <TouchableOpacity
              onPress={item.onPress}
              activeOpacity={0.6}
              disabled={isDeleting}
              className={`flex-row items-center gap-3 px-3 py-2.5 rounded-2xl mb-0.5 ${
                item.danger ? "bg-red-500/5" : ""
              }`}
            >
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  item.danger
                    ? "bg-red-500/10"
                    : "bg-background-secondary dark:bg-dark-background-secondary"
                }`}
              >
                {item.danger && isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? "#EF4444" : "#374151"}
                  />
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={`text-sm font-semibold leading-5 ${
                    item.danger
                      ? "text-red-500"
                      : "text-text dark:text-dark-text"
                  }`}
                >
                  {item.danger && isDeleting
                    ? t("answerData.deleting")
                    : item.title}
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    item.danger
                      ? "text-red-300"
                      : "text-text-secondary dark:text-dark-text-secondary"
                  }`}
                >
                  {item.subtitle}
                </Text>
              </View>

              {!(item.danger && isDeleting) && (
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default AnswerThreeDotMenu;
