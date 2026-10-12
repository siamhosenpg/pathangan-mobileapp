import {
  useBlockUserMutation,
  useUnblockUserMutation,
  type BlockedUser,
} from "@/redux/api/blockApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

export const useBlockActions = () => {
  const { t } = useTranslation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  // ব্লক করার আগে নিশ্চিত করা হয়। "ব্লক করুন" চাপলে সাথে সাথে onDone চলে (UI আগে বদলায়),
  // তারপর request যায়। fail করলে RTK নিজেই rollback করে, আমরা শুধু alert দেখাই।
  const confirmBlock = (user: BlockedUser, onDone?: () => void) => {
    Alert.alert(
      t("blockedData.blockConfirmTitle", { name: user.name }),
      t("blockedData.blockConfirmMessage"),
      [
        {
          text: t("blockedData.cancel"),
          style: "cancel",
        },
        {
          text: t("blockedData.blockAction"),
          style: "destructive",
          onPress: async () => {
            onDone?.();
            try {
              await blockUser({ userId: user._id, user }).unwrap();
            } catch (err) {
              Alert.alert(t("blockedData.blockFailed"), getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const confirmUnblock = (user: BlockedUser, onDone?: () => void) => {
    Alert.alert(
      t("blockedData.unblockConfirmTitle", { name: user.name }),
      t("blockedData.unblockConfirmMessage"),
      [
        {
          text: t("blockedData.cancel"),
          style: "cancel",
        },
        {
          text: t("blockedData.unblockAction"),
          onPress: async () => {
            onDone?.();
            try {
              await unblockUser(user._id).unwrap();
            } catch (err) {
              Alert.alert(t("blockedData.unblockFailed"), getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  return { confirmBlock, confirmUnblock };
};
