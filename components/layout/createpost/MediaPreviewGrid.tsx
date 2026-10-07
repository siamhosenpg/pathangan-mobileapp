import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface MediaItem {
  uri: string;
  type: "image" | "video";
  fileName?: string;
  mimeType?: string;
  thumbnail?: string;
}

interface Props {
  media: MediaItem[];
  onRemove: (index: number) => void;
}

const GAP = 10;
// একাধিক মিডিয়া হলে পরের স্লাইডের একটু অংশ উঁকি দেবে
const MULTI_WIDTH_RATIO = 0.86;

const Separator = () => <View style={{ width: GAP }} />;

const MediaPreviewGrid = ({ media, onRemove }: Props) => {
  const { t } = useTranslation();
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);

  const count = media.length;
  const isSingle = count === 1;
  const itemWidth = isSingle
    ? containerWidth
    : Math.round(containerWidth * MULTI_WIDTH_RATIO);
  const step = itemWidth + GAP;
  // মিডিয়া মুছে গেলে index যেন সীমার বাইরে না যায়
  const activeIndex = Math.min(scrollIndex, Math.max(count - 1, 0));

  useEffect(() => {
    if (count === 0) setScrollIndex(0);
  }, [count]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (itemWidth <= 0) return;
      const raw = Math.round(e.nativeEvent.contentOffset.x / step);
      const next = Math.max(0, Math.min(raw, count - 1));
      setScrollIndex((prev) => (prev === next ? prev : next));
    },
    [itemWidth, step, count],
  );

  if (count === 0) return null;

  const renderItem = ({ item, index }: ListRenderItemInfo<MediaItem>) => {
    const aspectRatio = isSingle ? (item.type === "video" ? 16 / 9 : 4 / 3) : 1;

    return (
      <View
        style={{ width: itemWidth, aspectRatio }}
        className="rounded-2xl overflow-hidden items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
      >
        {/* ভিডিওর থাম্বনেইল লোড না হলেও যেন ফাঁকা না দেখায় */}
        {item.type === "video" && (
          <Ionicons name="videocam-outline" size={36} color="#9CA3AF" />
        )}

        <Image
          source={{ uri: item.thumbnail ?? item.uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* video overlay */}
        {item.type === "video" && (
          <>
            <View
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              className="items-center justify-center bg-black/25"
            >
              <View className="w-14 h-14 rounded-full bg-black/50 items-center justify-center">
                <Ionicons name="play" size={26} color="#fff" />
              </View>
            </View>

            <View
              pointerEvents="none"
              className="absolute bottom-2.5 left-2.5 bg-black/60 px-2.5 py-1 rounded-full flex-row items-center gap-1"
            >
              <Ionicons name="videocam" size={12} color="#fff" />
              <Text className="text-white text-xs font-medium">
                {t("postData.video")}
              </Text>
            </View>
          </>
        )}

        {/* counter (1/5) */}
        {count > 1 && (
          <View
            pointerEvents="none"
            className="absolute top-2.5 left-2.5 bg-black/60 px-2.5 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-semibold">
              {index + 1}/{count}
            </Text>
          </View>
        )}

        {/* remove button */}
        <TouchableOpacity
          onPress={() => onRemove(index)}
          hitSlop={8}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("postData.removeMedia")}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
        >
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View onLayout={handleLayout} className="gap-3">
      {containerWidth > 0 && (
        <FlatList
          horizontal
          data={media}
          keyExtractor={(m) => m.uri}
          extraData={itemWidth}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          showsHorizontalScrollIndicator={false}
          snapToInterval={step}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          scrollEnabled={!isSingle}
          nestedScrollEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      {/* dot indicator */}
      {count > 1 && (
        <View className="flex-row items-center justify-center gap-1.5">
          {media.map((m, i) => (
            <View
              key={m.uri}
              className={`h-1.5 rounded-full ${
                i === activeIndex
                  ? "w-4 bg-accent"
                  : "w-1.5 bg-text-tertiary dark:bg-dark-text-tertiary opacity-40"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default MediaPreviewGrid;
