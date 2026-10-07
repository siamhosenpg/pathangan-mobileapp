// PostProfileTop.tsx
import type { PostUser } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../../badges/GreenMark";
import { useBottomSheet } from "../../bottom-sheet/BottomSheetProvider";

import TimeAgo from "../../datetime/TimeAgo";
import PostThreeDotMenu from "../../threedotmenu/PostThreeDotMenu";

interface Props {
  // user ডিলিট হয়ে গেলে populate করা userid null আসতে পারে
  user: PostUser | null | undefined;
  createdAt: string;
  postId: string;
}

const PostProfileTop = ({ user, createdAt, postId }: Props) => {
  const router = useRouter();
  const { open } = useBottomSheet();
  const { t } = useTranslation();

  // user না থাকলে (ডিলিট করা অ্যাকাউন্ট)
  const isDeletedUser = !user;

  return (
    <View className="px-4 pb-1 flex-row items-center justify-between gap-2">
      <View className="flex-row items-center justify-start gap-2 flex-1">
        <TouchableOpacity
          className="border border-border dark:border-dark-border"
          disabled={isDeletedUser}
          activeOpacity={isDeletedUser ? 1 : 1}
          onPress={() => {
            if (user?.username) router.push(`/${user.username}` as any);
          }}
          style={{
            width: 38,
            height: 38,
            borderRadius: 99,
            overflow: "hidden",
            backgroundColor: "rgba(0,145,77,0.15)",
            flexShrink: 0,
          }}
        >
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isDeletedUser ? (
                <Ionicons name="person" size={18} color="#9CA3AF" />
              ) : (
                <Text
                  style={{
                    color: "#00914d",
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View className="flex-row items-center gap-1">
            <Text
              className={
                isDeletedUser
                  ? "text-text dark:text-dark-text"
                  : "text-text dark:text-dark-text"
              }
              style={{ fontWeight: "600", fontSize: 14, flexShrink: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isDeletedUser ? t("postData.deletedUser") : user?.name}
            </Text>
            {user?.greenmarkVerified && (
              <GreenMark mark={!!user.greenmarkVerified} size={14} />
            )}
          </View>
          <Text className="text-text-secondary dark:text-dark-text-secondary">
            <TimeAgo
              className="text-xs text-text-tertiary dark:text-dark-text-tertiary font-semibold"
              date={createdAt}
            />
          </Text>
        </View>
      </View>

      {/* Three dot button — সবসময় দেখাবে (report ইত্যাদির জন্য) */}
      <TouchableOpacity
        hitSlop={8}
        onPress={() =>
          open(
            <PostThreeDotMenu
              postId={postId}
              postAuthorId={user?._id ?? null}
            />,
          )
        }
      >
        <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

export default PostProfileTop;
