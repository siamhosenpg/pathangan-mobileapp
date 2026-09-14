import Share from "@/assets/icons/redo.svg";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Share as RNShare, Text, TouchableOpacity } from "react-native";

interface ShareButtonProps {
  postId: string;
  title?: string;
}

const ShareButton = ({ postId, title }: ShareButtonProps) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  const handleShare = async () => {
    try {
      const shareUrl = `https://pathangan.com/post/${postId}`;
      const message = title ? `${title}\n\n${shareUrl}` : shareUrl;

      await RNShare.share({
        message,
        url: shareUrl, // iOS এ আলাদা করে url ধরে, ভালো preview এর জন্য
        title: title ?? t("share"),
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center gap-1.5 py-3.5"
      onPress={handleShare}
    >
      <Share width={18} height={16} color={iconColor} />
      <Text className="font-semibold text-base text-text dark:text-dark-text">
        {t("share")}
      </Text>
    </TouchableOpacity>
  );
};

export default ShareButton;
