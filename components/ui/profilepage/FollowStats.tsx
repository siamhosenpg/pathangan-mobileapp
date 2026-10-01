import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import FollowListSheet from "@/components/ui/bottom-sheet/follow/FollowListSheet";
import type { ActivityStats } from "@/types/userTypes";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import BanglaNumber from "../extra/BanglaNumber";

interface Props {
  activityStats?: ActivityStats;
  userId?: string; // dile click korle sheet khulbe
}

const FollowStats = ({ activityStats, userId }: Props) => {
  const { t } = useTranslation();
  const { open } = useBottomSheet();

  const openList = (type: "followers" | "following") => {
    if (!userId) return;
    // scrollable: false → FlatList nijei scroll handle korbe
    open(<FollowListSheet userId={userId} type={type} />, {
      scrollable: false,
    });
  };

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!userId}
        onPress={() => openList("followers")}
        className="flex-row items-center gap-2"
      >
        <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
          <BanglaNumber value={activityStats?.totalFollowers ?? 0} />
        </Text>
        <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
          {t("followers")}
        </Text>
      </TouchableOpacity>

      <View className="w-px h-4 bg-border dark:bg-dark-border" />

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!userId}
        onPress={() => openList("following")}
        className="flex-row items-center gap-2"
      >
        <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
          <BanglaNumber value={activityStats?.totalFollowing ?? 0} />
        </Text>
        <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
          {t("following")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FollowStats;
