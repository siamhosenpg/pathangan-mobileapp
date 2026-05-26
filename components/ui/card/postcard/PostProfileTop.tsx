import type { PostUser } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../../badges/GreenMark";
import BanglaNumber from "../../extra/BanglaNumber";
import PostThreeDotMenu from "../../threedotmenu/PostThreeDotMenu";
// import FollowButton from "@/components/ui/buttons/FollowButton";

interface Props {
  user: PostUser;
  createdAt: string;
  postId: string;
}

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} মাস আগে`;
  if (days > 0) return `${days} দিন আগে`;
  if (hours > 0) return `${hours} ঘণ্টা আগে`;
  if (minutes > 0) return `${minutes} মিনিট আগে`;
  return "এইমাত্র";
};

const PostProfileTop = ({ user, createdAt, postId }: Props) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View className="px-4 pb-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <TouchableOpacity
            className="border border-border dark:border-dark-border"
            onPress={() => router.push(`/${user.username}` as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              overflow: "hidden",
              backgroundColor: "rgba(0,145,77,0.15)",
              flexShrink: 0,
            }}
          >
            {user.profileImage ? (
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
                <Text
                  style={{
                    color: "#00914d",
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View className="flex-row items-center gap-1">
              <Text
                className="flex-row items-center gap-1 text-text dark:text-dark-text"
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {user.name}
              </Text>
              {user?.greenmarkVerified && (
                <GreenMark mark={!!user.greenmarkVerified} size={14} />
              )}
              {/* <FollowButton targetUserId={user._id} /> */}
            </View>
            <Text
              className="text-text-secondary dark:text-dark-text-secondary"
              style={{ fontSize: 12 }}
            >
              <BanglaNumber value={getTimeAgo(createdAt)} />
            </Text>
          </View>
        </View>

        {/* Three dot button */}
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <PostThreeDotMenu
        postId={postId}
        postAuthorId={user._id}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
};

export default PostProfileTop;
