import { useIconColor } from "@/hooks/useIconColor";
import { getAvatarUrl } from "@/utils/imageUrl";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo, useState } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

interface ProfileImageProps {
  // ছবির URL (না থাকলে নামের প্রথম অক্ষর দেখাবে)
  uri?: string | null;
  // নাম: ছবি না থাকলে প্রথম অক্ষর এখান থেকে আসবে
  name?: string | null;
  // গোল ছবির ব্যাস (px)
  size?: number;
  // ডিলিট করা ইউজার হলে person আইকন দেখাবে
  isDeleted?: boolean;
  // cell recycle হলে আগের ছবি দেখানো আটকাতে (সাধারণত user._id)
  recyclingKey?: string;
  // বাইরে থেকে বাড়তি style দিতে চাইলে
  style?: StyleProp<ViewStyle>;
  // border দেখাবে কি না
  bordered?: boolean;
}

const ProfileImage = ({
  uri,
  name,
  size = 38,
  isDeleted = false,
  recyclingKey,
  style,
  bordered = true,
}: ProfileImageProps) => {
  const { secondary, isDark } = useIconColor();
  const [failed, setFailed] = useState(false);

  const imageUrl = getAvatarUrl(uri, size);
  const showImage = !!imageUrl && !failed && !isDeleted;

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: "hidden",
    backgroundColor: "rgba(0,145,77,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: bordered ? 0.5 : 0,
    borderColor: isDark ? "#2e2e2e" : "#e7e7e7",
  };

  return (
    <View style={[containerStyle, style]}>
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          recyclingKey={recyclingKey ?? uri ?? undefined}
          onError={() => setFailed(true)}
        />
      ) : isDeleted ? (
        <Ionicons name="person" size={size * 0.47} color={secondary} />
      ) : (
        <Text
          style={{
            color: "#00914d",
            fontWeight: "700",
            fontSize: size * 0.47,
          }}
        >
          {name?.charAt(0)?.toUpperCase() ?? "?"}
        </Text>
      )}
    </View>
  );
};

export default memo(ProfileImage);
