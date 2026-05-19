import type { PostUser } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
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
            onPress={() => router.push(`/user/${user.username}` as any)}
            style={{
              width: 44,
              height: 44,
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
            <View className="flex-row items-center gap-2">
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {user.name}
              </Text>
              {user?.badges && user.badges.length > 0 && (
                <Ionicons name="checkmark-circle" size={15} color="#00914d" />
              )}
              {/* <FollowButton targetUserId={user._id} /> */}
            </View>
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 1 }}>
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
