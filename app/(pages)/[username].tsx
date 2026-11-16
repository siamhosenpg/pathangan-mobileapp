import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import BackHeader from "@/components/ui/headers/BackHeader";
import ProfileHeaderSkeleton from "@/components/ui/headers/ProfileHeaderSkeleton";
import ProfileAbout from "@/components/ui/profilepage/ProfileAbout";
import ProfilePosts from "@/components/ui/profilepage/ProfilePosts";
import ProfileTopSection from "@/components/ui/profilepage/ProfileTopSection";
import ProfileTopSectionSkeleton from "@/components/ui/profilepage/ProfileTopSectionSkeleton";
import { ProfileShakeContext } from "@/contexts/ProfileShakeContext";
import useShake from "@/hooks/shake/useShake";
import { useGetUserByUsernameQuery } from "@/redux/api/userApi";
import NetInfo from "@react-native-community/netinfo";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  // currentData: only data for the current username (never stale data of another user)
  const {
    currentData: user,
    isLoading,
    isFetching,
    refetch,
  } = useGetUserByUsernameQuery(username ?? "", {
    skip: !username,
    refetchOnMountOrArgChange: true,
  });

  // উপরে টেনে নামালে profile data আবার আনবে
  // (spinner ProfilePosts এর RefreshControl ই দেখায়, posts ও সেখানেই refetch হয়)
  const handleRefresh = useCallback(async () => {
    // নেট না থাকলে refetch চালাবে না, পুরনো profile থাকবে
    const net = await NetInfo.fetch();
    if (net.isConnected === false || net.isInternetReachable === false) {
      return;
    }

    try {
      await refetch();
    } catch {
      // fail হলেও পুরনো profile স্ক্রিনে থাকবে
    }
  }, [refetch]);

  // ── Shake + haptic (reusable hook) ──
  // হুকগুলো অবশ্যই early return এর আগে থাকতে হবে
  const { shake, shakeStyle } = useShake({ haptic: "light" });

  const triggerShake = useCallback(() => shake(), [shake]);

  const shakeContextValue = useMemo(
    () => ({ currentUsername: username ?? null, triggerShake }),
    [username, triggerShake],
  );

  // Skeleton only when there is nothing to show yet.
  // Background refetches (e.g. after follow, pull-to-refresh) must not replace the page.
  const showSkeleton = isLoading || (!user && isFetching);

  if (showSkeleton) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background dark:bg-dark-background"
      >
        <ProfileHeaderSkeleton />
        <ProfileTopSectionSkeleton />
        <PostCardSkeleton />
      </SafeAreaView>
    );
  }

  // শুধু তখনই error পেজ, যখন দেখানোর মতো user-ই নেই।
  // refetch fail হলেও আগের user থাকলে profile থেকে যাবে।
  if (!user) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background dark:bg-dark-background"
      >
        <BackHeader />
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary text-sm dark:text-dark-text-secondary">
            ব্যবহারকারী পাওয়া যায়নি
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Passed as ListHeaderComponent of ProfilePosts:
  // avoids ScrollView + FlatList nesting, and FlatList scrolls by itself
  // so onViewableItemsChanged keeps working
  const profileHeader = (
    <View>
      <ProfileTopSection data={user} />
      {user.educations?.length || user.work?.length ? (
        <View className="h-1" />
      ) : null}
      <ProfileAbout
        educations={user.educations ?? []}
        work={user.work ?? []}
        user={user}
      />
      <View className="h-1" />
    </View>
  );

  return (
    <ProfileShakeContext.Provider value={shakeContextValue}>
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background dark:bg-dark-background"
      >
        <BackHeader />
        {/* শুধু নিচের অংশ কাঁপবে, BackHeader স্থির থাকবে */}
        <Animated.View style={[{ flex: 1 }, shakeStyle]}>
          <ProfilePosts
            userid={user._id}
            listHeader={profileHeader}
            onRefresh={handleRefresh}
          />
        </Animated.View>
      </SafeAreaView>
    </ProfileShakeContext.Provider>
  );
}
