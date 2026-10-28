import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import {
  useFollowList,
  type FollowListEntry,
  type FollowListType,
} from "@/hooks/follow/useFollowList";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GreenMark from "../../badges/GreenMark";

const SHEET_CONTENT_HEIGHT = Dimensions.get("window").height * 0.6;

interface Props {
  userId: string;
  type: FollowListType;
}

const FollowListSheet = ({ userId, type }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { close } = useBottomSheet();

  const {
    items,
    isLoading,
    isFetchingMore,
    isRefreshing,
    isError,
    loadMore,
    refresh,
  } = useFollowList(type, userId);

  const goToProfile = useCallback(
    (username?: string) => {
      // deleted user হলে username থাকে না, তখন কিছু করবে না
      if (!username) return;
      close();
      // ⚠️ tomar profile route-er path onujayi eta change koro
      router.push(`/(pages)/${username}` as any);
    },
    [close, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: FollowListEntry }) => {
      // user null হতে পারে (ইউজার ডিলিট হলে)
      const user = item.user as any;
      const isDeleted = !user;

      // bio থাকলে bio, না থাকলে username (শুধু একটাই দেখাবে)
      const bio = typeof user?.bio === "string" ? user.bio.trim() : "";
      const subText = bio || (user?.username ? `@${user.username}` : "");

      return (
        <TouchableOpacity
          activeOpacity={isDeleted ? 1 : 0.7}
          disabled={isDeleted}
          onPress={() => goToProfile(user?.username)}
          className="flex-row items-center gap-3 px-4 py-3"
          style={{ opacity: isDeleted ? 0.6 : 1 }}
        >
          <View className="w-12 h-12 rounded-full border border-border dark:border-dark-border overflow-hidden bg-accent/20">
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-xl font-bold text-accent uppercase">
                  {user?.name?.charAt(0) ?? "?"}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View className="flex-row items-center gap-1">
              <Text
                className="font-bold text-text dark:text-dark-text"
                style={{ flexShrink: 1 }}
                numberOfLines={1}
              >
                {user?.name ?? "Deleted user"}
              </Text>
              {!!user?.greenmarkVerified && <GreenMark mark size={14} />}
            </View>
            {!!subText && (
              <Text
                className="text-xs text-text-secondary dark:text-dark-text-secondary"
                numberOfLines={1}
              >
                {subText}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [goToProfile],
  );

  const keyExtractor = useCallback(
    (item: FollowListEntry) => item.followId,
    [],
  );

  return (
    <View style={{ height: SHEET_CONTENT_HEIGHT }}>
      <Text className="px-4 pb-2 text-base font-bold text-text dark:text-dark-text">
        {t(type)}
      </Text>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError && items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-text-secondary dark:text-dark-text-secondary">
            {t("somethingWentWrong")}
          </Text>
          <TouchableOpacity
            onPress={refresh}
            className="px-4 py-2 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="font-semibold text-text dark:text-dark-text">
              {t("retry")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          initialNumToRender={12}
          windowSize={7}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16 gap-2">
              <Text className="text-3xl">📭</Text>
              <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
                {type === "followers" ? t("noFollowers") : t("noFollowing")}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : isError ? (
              <TouchableOpacity
                onPress={loadMore}
                className="py-4 items-center"
              >
                <Text className="text-text-secondary dark:text-dark-text-secondary">
                  {t("retry")}
                </Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      )}
    </View>
  );
};

export default FollowListSheet;
