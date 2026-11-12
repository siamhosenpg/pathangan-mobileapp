import { useIconColor } from "@/hooks/useIconColor";
import { getOptimizedUrl, type ImageGravity } from "@/utils/imageUrl";
import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageContentFit } from "expo-image";
import { memo, useEffect, useState } from "react";
import {
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface OptimizedImageProps {
  // ছবির URL (না থাকলে বা error হলে fallback আইকন দেখাবে)
  uri?: string | null;
  // ছবির প্রস্থ (px)। না দিলে parent-এর পুরো প্রস্থ নেবে
  width?: number;
  // প্রস্থ / উচ্চতা (ডিফল্ট 1 = বর্গ)। যেমন 2/3 কভার, 6/2 ব্যানার
  aspectRatio?: number;
  // কোণা কতটা গোল হবে (px)
  radius?: number;
  // true হলে পুরোপুরি গোল (radius উপেক্ষা করবে)
  circle?: boolean;
  // Cloudinary কোন অংশ ধরে crop করবে: auto = গুরুত্বপূর্ণ অংশ, face = মুখ
  gravity?: ImageGravity;
  // ছবি না থাকলে যে আইকন দেখাবে
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  // list-এ cell recycle হলে আগের ছবি দেখানো আটকাতে (যেমন item._id বা slug)
  recyclingKey?: string;
  contentFit?: ImageContentFit;
  // NativeWind class (যেমন border দিতে চাইলে)
  className?: string;
  // বাইরে থেকে বাড়তি style
  style?: StyleProp<ViewStyle>;
}

const OptimizedImage = ({
  uri,
  width,
  aspectRatio = 1,
  radius = 0,
  circle = false,
  gravity = "auto",
  fallbackIcon = "image-outline",
  recyclingKey,
  contentFit = "cover",
  className,
  style,
}: OptimizedImageProps) => {
  const { secondary } = useIconColor();
  const { width: windowWidth } = useWindowDimensions();
  const [failed, setFailed] = useState(false);
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);

  // width না দিলে full-width মোড
  const isFull = width === undefined;

  // মাপা না হওয়া পর্যন্ত স্ক্রিনের প্রস্থ ধরে নেয়, যাতে ছবি আসতে দেরি না হয়
  const effectiveWidth = width ?? layoutWidth ?? windowWidth;
  const height = effectiveWidth / aspectRatio;

  const imageUrl = getOptimizedUrl(uri, effectiveWidth, aspectRatio, gravity);
  const showImage = !!imageUrl && !failed;

  // URL বদলালে আগের error মুছে ফেলে
  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  // full-width মোডে parent-এর আসল প্রস্থ মাপে
  const handleLayout = (e: LayoutChangeEvent) => {
    if (!isFull) return;
    const w = Math.round(e.nativeEvent.layout.width);
    setLayoutWidth((prev) => (prev === w ? prev : w));
  };

  return (
    <View
      onLayout={handleLayout}
      className={`bg-background-tertiary dark:bg-dark-background-tertiary ${className ?? ""}`}
      style={[
        {
          width: isFull ? "100%" : width,
          aspectRatio,
          borderRadius: circle ? Math.max(effectiveWidth, height) / 2 : radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit={contentFit}
          cachePolicy="memory-disk"
          transition={150}
          recyclingKey={recyclingKey ?? uri ?? undefined}
          onError={() => setFailed(true)}
        />
      ) : (
        <Ionicons
          name={fallbackIcon}
          size={Math.min(effectiveWidth, height) * 0.3}
          color={secondary}
        />
      )}
    </View>
  );
};

export default memo(OptimizedImage);
