// PostImage.tsx
import { getFitUrl, getOptimizedUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import ImageFullScreen from "./ImageFullScreen";

interface Props {
  images: string[];
  // list-এ cell recycle হলে আগের ছবি দেখানো আটকাতে (post._id)
  postId?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ---------- একটা ছবির মাপ ----------
const MIN_HEIGHT = SCREEN_WIDTH * 0.5;
const MAX_HEIGHT = 500;

// ---------- slider এর মাপ ----------
const PADDING = 8;
const ITEM_GAP = 6;
const VISIBLE_COUNT = 1.6;
const ITEM_WIDTH =
  (SCREEN_WIDTH - PADDING * 2 - ITEM_GAP * (VISIBLE_COUNT - 1)) / VISIBLE_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH * (4 / 3);
const ITEM_RATIO = ITEM_WIDTH / ITEM_HEIGHT; // 3/4

// ---------- full screen এর জন্য ছবি ----------
const FULLSCREEN_WIDTH = SCREEN_WIDTH * 1.5; // zoom করলে যেন ফাটা না দেখায়
const FULLSCREEN_MAX_PX = 2048;

// একবার মাপা উচ্চতা মনে রাখে, list-এ ফিরে এলে ছবি লাফায় না
const heightCache = new Map<string, number>();

const clampHeight = (w: number, h: number) => {
  const calculated = SCREEN_WIDTH * (h / w);
  return Math.min(Math.max(calculated, MIN_HEIGHT), MAX_HEIGHT);
};

const Separator = () => <View style={{ width: ITEM_GAP }} />;

/* ============================================================
   একটা ছবি: full width, উচ্চতা auto (min/max এর মধ্যে)
   ============================================================ */
const SingleImage = memo(
  ({ uri, recyclingKey }: { uri: string; recyclingKey?: string }) => {
    const [imageHeight, setImageHeight] = useState<number>(
      heightCache.get(uri) ?? SCREEN_WIDTH,
    );
    const [fullScreenVisible, setFullScreenVisible] = useState(false);
    const [failed, setFailed] = useState(false);

    const displayUrl = useMemo(
      () => getFitUrl(uri, SCREEN_WIDTH) ?? uri,
      [uri],
    );
    const fullUrl = useMemo(
      () => getFitUrl(uri, FULLSCREEN_WIDTH, FULLSCREEN_MAX_PX) ?? uri,
      [uri],
    );

    // ImageFullScreen এর জন্য array (প্রতি render-এ নতুন না বানাতে useMemo)
    const fullImages = useMemo(() => [fullUrl], [fullUrl]);
    const fullPlaceholders = useMemo(() => [displayUrl], [displayUrl]);

    // uri বদলালে আগের অবস্থা মুছে নতুন করে শুরু
    useEffect(() => {
      setFailed(false);
      setImageHeight(heightCache.get(uri) ?? SCREEN_WIDTH);
    }, [uri]);

    // ছবি load হলেই তার আসল মাপ দিয়ে উচ্চতা ঠিক করে (আলাদা download লাগে না)
    const handleLoad = useCallback(
      (e: { source: { width: number; height: number } }) => {
        const { width, height } = e.source;
        if (!width || !height) return;
        const h = clampHeight(width, height);
        heightCache.set(uri, h);
        setImageHeight(h);
      },
      [uri],
    );

    return (
      <>
        <TouchableOpacity
          onPress={() => setFullScreenVisible(true)}
          activeOpacity={0.9}
        >
          <View
            className="border-t border-b border-border/60 dark:border-dark-border/70 bg-background-tertiary dark:bg-dark-background-tertiary"
            style={{ width: SCREEN_WIDTH, height: imageHeight }}
          >
            {!failed && (
              <Image
                source={{ uri: displayUrl }}
                style={{ flex: 1 }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
                recyclingKey={recyclingKey ?? uri}
                onLoad={handleLoad}
                onError={() => setFailed(true)}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Full screen modal */}
        <ImageFullScreen
          images={fullImages}
          placeholders={fullPlaceholders}
          initialIndex={0}
          visible={fullScreenVisible}
          onClose={() => setFullScreenVisible(false)}
        />
      </>
    );
  },
);

/* ============================================================
   slider এর একটা item
   ============================================================ */
const SliderItem = memo(
  ({
    uri,
    index,
    onPress,
  }: {
    uri: string;
    index: number;
    onPress: (i: number) => void;
  }) => {
    const [loading, setLoading] = useState(true);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(index)}
        className="rounded-xl overflow-hidden"
        style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
      >
        <View className="flex-1 rounded-xl overflow-hidden border border-border/50 dark:border-dark-border/50">
          <Image
            source={{ uri }}
            style={{ flex: 1 }}
            contentFit="cover"
            cachePolicy="memory-disk"
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </View>

        {loading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.06)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

/* ============================================================
   একাধিক ছবি: slider
   ============================================================ */
const MultiImage = memo(({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  // slider এর জন্য ছোট crop করা ছবি (3:4)
  const slideUrls = useMemo(
    () =>
      images.map(
        (u) => getOptimizedUrl(u, ITEM_WIDTH, ITEM_RATIO, "auto") ?? u,
      ),
    [images],
  );

  // full screen এর জন্য বড় কিন্তু original এর চেয়ে ছোট ছবি
  const fullUrls = useMemo(
    () =>
      images.map((u) => getFitUrl(u, FULLSCREEN_WIDTH, FULLSCREEN_MAX_PX) ?? u),
    [images],
  );

  // Prefetch: activeIndex এর আগে 1টা, পরে 3টা preload করবে
  useEffect(() => {
    const start = Math.max(activeIndex - 1, 0);
    const end = Math.min(activeIndex + 4, slideUrls.length);
    const urls = slideUrls.slice(start, end);
    if (urls.length) Image.prefetch(urls, "memory-disk");
  }, [activeIndex, slideUrls]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setActiveIndex(idx);
    },
    [],
  );

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 50 }),
    [],
  );

  const handleImagePress = useCallback((index: number) => {
    setFullScreenIndex(index);
    setFullScreenVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setFullScreenVisible(false);
  }, []);

  return (
    <View style={{ height: ITEM_HEIGHT }}>
      <FlatList
        data={slideUrls}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        initialNumToRender={3}
        windowSize={5}
        maxToRenderPerBatch={3}
        contentContainerStyle={{
          paddingLeft: PADDING,
          paddingRight: PADDING,
        }}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_GAP,
          offset: (ITEM_WIDTH + ITEM_GAP) * index,
          index,
        })}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ItemSeparatorComponent={Separator}
        renderItem={({ item, index }) => (
          <SliderItem uri={item} index={index} onPress={handleImagePress} />
        )}
      />

      {images.length > 1 && (
        <View
          style={{
            position: "absolute",
            bottom: 10,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          {images.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </View>
      )}

      <ImageFullScreen
        images={fullUrls}
        placeholders={slideUrls}
        initialIndex={fullScreenIndex}
        visible={fullScreenVisible}
        onClose={handleClose}
      />
    </View>
  );
});

/* ============================================================
   PostImage: একটা হলে SingleImage, একাধিক হলে MultiImage
   ============================================================ */
const PostImage = ({ images, postId }: Props) => {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <SingleImage
        uri={images[0]}
        recyclingKey={postId ? `${postId}-0` : undefined}
      />
    );
  }

  return <MultiImage images={images} />;
};

export default memo(PostImage);
