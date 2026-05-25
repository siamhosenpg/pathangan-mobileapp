import type { ActivityStats } from "@/types/userTypes";
import { Text, View } from "react-native";
import BanglaNumber from "../extra/BanglaNumber";

interface Props {
  activityStats?: ActivityStats;
}

const FollowStats = ({ activityStats }: Props) => {
  return (
    <View className="flex-row items-center gap-2 ">
      <View className="flex-row items-center gap-2">
        <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
          <BanglaNumber value={activityStats?.totalFollowers ?? 0} />
        </Text>
        <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
          অনুসরণকারী
        </Text>
      </View>

      <View className="w-px h-4 bg-border dark:bg-dark-border" />

      <View className="flex-row items-center gap-2">
        <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
          <BanglaNumber value={activityStats?.totalFollowing ?? 0} />
        </Text>
        <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
          অনুসরণ করছি
        </Text>
      </View>
    </View>
  );
};

export default FollowStats;
