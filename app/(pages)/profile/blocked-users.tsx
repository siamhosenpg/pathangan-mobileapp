import GreenMark from "@/components/ui/badges/GreenMark";
import BackHeader from "@/components/ui/headers/BackHeader";
import { useBlockActions } from "@/hooks/block/useBlockActions";
import {
  useGetBlockedUsersQuery,
  type BlockedUser,
} from "@/redux/api/blockApi";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RowProps {
  user: BlockedUser;
  onUnblock: (user: BlockedUser) => void;
}

const BlockedUserRow = memo(({ user, onUnblock }: RowProps) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      {/* Avatar */}
      <View
        className="w-12 h-12 rounded-full border border-border dark:border-dark-border overflow-hidden bg-accent/20"
        style={{ flexShrink: 0 }}
      >
        {user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-xl font-bold text-accent uppercase">
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Name + username */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View className="flex-row items-center gap-1">
          <Text
            className="font-bold text-text dark:text-dark-text"
            style={{ flexShrink: 1 }}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          {user.greenmarkVerified && <GreenMark mark size={14} />}
        </View>
        <Text
          className="text-sm text-text-secondary dark:text-dark-text-secondary"
          numberOfLines={1}
        >
          @{user.username}
        </Text>
      </View>

      {/* Unblock button */}
      <TouchableOpacity
        onPress={() => onUnblock(user)}
        activeOpacity={0.7}
        className="px-4 py-2 rounded-full border border-border dark:border-dark-border"
      >
        <Text className="font-semibold text-accent">
          {t("blockedData.unblock")}
        </Text>
      </TouchableOpacity>
    </View>
  );
});
BlockedUserRow.displayName = "BlockedUserRow";

export default function BlockedUsersScreen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { confirmUnblock } = useBlockActions();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetBlockedUsersQuery(undefined, { refetchOnMountOrArgChange: true });

  const users = data ?? [];

  let body;

  if (isLoading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#00914d" />
      </View>
    );
  } else if (isError && users.length === 0) {
    body = (
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
          {t("blockedData.loadFailed")}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="px-4 py-2 rounded-full border border-border dark:border-dark-border"
        >
          <Text className="font-semibold text-accent">
            {t("blockedData.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BlockedUserRow user={item} onUnblock={(u) => confirmUnblock(u)} />
        )}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        contentContainerStyle={users.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <Ionicons
              name="ban-outline"
              size={40}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
            <Text className="text-base font-semibold text-center text-text dark:text-dark-text">
              {t("blockedData.empty")}
            </Text>
            <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
              {t("blockedData.emptyHint")}
            </Text>
          </View>
        }
      />
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <BackHeader />

      {body}
    </SafeAreaView>
  );
}
