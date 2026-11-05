// PostProfileTop.tsx
import ProfileImage from "@/components/ui/avatar/ProfileImage";
import { useProfileShake } from "@/contexts/ProfileShakeContext";
import { useIconColor } from "@/hooks/useIconColor";
import type { PostUser } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
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
  const { secondary } = useIconColor();

  // যে profile এ আছি তার username + shake trigger
  const { currentUsername, triggerShake } = useProfileShake();

  // user না থাকলে (ডিলিট করা অ্যাকাউন্ট)
  const isDeletedUser = !user;

  const handleProfilePress = () => {
    if (!user?.username) return;

    // এই user এর profile এই আছি — আবার navigate না করে shake করাও
    if (
      currentUsername &&
      currentUsername.toLowerCase() === user.username.toLowerCase()
    ) {
      triggerShake();
      return;
    }

    router.push(`/${user.username}` as any);
  };

  return (
    <View className="px-4 pb-1 flex-row items-center justify-between gap-2">
      <View className="flex-row items-center justify-start gap-2 flex-1">
        <TouchableOpacity
          disabled={isDeletedUser}
          activeOpacity={1}
          onPress={handleProfilePress}
        >
          <ProfileImage
            uri={user?.profileImage}
            name={user?.name}
            size={38}
            isDeleted={isDeletedUser}
            recyclingKey={user?._id}
          />
        </TouchableOpacity>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View className="flex-row items-center gap-1">
            <Text
              className="text-text dark:text-dark-text"
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
        <Ionicons name="ellipsis-horizontal" size={22} color={secondary} />
      </TouchableOpacity>
    </View>
  );
};

export default PostProfileTop;
