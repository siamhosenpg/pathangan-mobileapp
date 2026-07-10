// ImageSlider.tsx
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import ImageFullScreen from "./ImageFullScreen";

interface Props {
  images: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PADDING = 8;
const ITEM_GAP = 6;
const VISIBLE_COUNT = 1.6;
const ITEM_WIDTH =
  (SCREEN_WIDTH - PADDING * 2 - ITEM_GAP * (VISIBLE_COUNT - 1)) / VISIBLE_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH * (4 / 3);

const ImageItem = memo(
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
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          className="border-border/50 border dark:border-dark-border/50 rounded-xl"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

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

const ImageSlider = memo(({ images }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  // ✅ Prefetch: activeIndex এর আগে 1টা, পরে 3টা preload করবে
  useEffect(() => {
    const start = Math.max(activeIndex - 1, 0);
    const end = Math.min(activeIndex + 4, images.length);
    images.slice(start, end).forEach((uri) => {
      Image.prefetch(uri);
    });
  }, [activeIndex, images]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setActiveIndex(idx);
    },
    [],
  );

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

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
        data={images}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        // ✅ এই দুটো key fix — শুরুতে বেশি render, window বড়
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
        // ✅ inline function সরিয়ে useCallback এ নেওয়া হয়েছে
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
        renderItem={({ item, index }) => (
          <ImageItem uri={item} index={index} onPress={handleImagePress} />
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
        images={images}
        initialIndex={fullScreenIndex}
        visible={fullScreenVisible}
        onClose={handleClose}
      />
    </View>
  );
});

export default ImageSlider;
