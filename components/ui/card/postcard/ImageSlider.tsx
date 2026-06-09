// ImageSlider.tsx
import React, { memo, useCallback, useState } from "react";
import {
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
  }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(index)}
      className="rounded-lg overflow-hidden"
      style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  ),
);

const ImageSlider = memo(({ images }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

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
        onViewableItemsChanged={({ viewableItems }) => {
          const idx = viewableItems[0]?.index;
          if (idx != null) setActiveIndex(idx);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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
