// ImageFullScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  // বড় ছবির URL
  images: string[];
  // বড় ছবি আসা পর্যন্ত যে ছোট ছবি দেখাবে (images এর সাথে একই ক্রমে, ঐচ্ছিক)
  placeholders?: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// component এর বাইরে রাখা হয়েছে, যাতে প্রতি render-এ নতুন object না হয়
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

/* ============================================================
   একটা ছবি: placeholder আগে, বড় ছবি এলে বদলে যাবে
   ============================================================ */
const FullScreenItem = memo(
  ({ uri, placeholder }: { uri: string; placeholder?: string }) => {
    const [failed, setFailed] = useState(false);

    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!failed ? (
          <Image
            source={{ uri }}
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
            // বড় ছবি আসা পর্যন্ত ফিডের ছবিটা সঙ্গে সঙ্গে দেখায়
            placeholder={placeholder ? { uri: placeholder } : undefined}
            placeholderContentFit="contain"
            onError={() => setFailed(true)}
          />
        ) : (
          // ছবি load না হলে
          <Ionicons
            name="image-outline"
            size={52}
            color="rgba(255,255,255,0.5)"
          />
        )}
      </View>
    );
  },
);

/* ============================================================
   Full screen modal
   ============================================================ */
const ImageFullScreen = ({
  images,
  placeholders,
  initialIndex,
  visible,
  onClose,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // প্রতিবার খোলার সময় (বা অন্য ছবিতে ট্যাপ করলে) সঠিক index সেট করে
  useEffect(() => {
    if (visible) setActiveIndex(initialIndex);
  }, [visible, initialIndex]);

  // পাশের ছবি আগে থেকে load করে রাখে, সোয়াইপ করলে দেরি হবে না
  useEffect(() => {
    if (!visible) return;
    const neighbors = [activeIndex - 1, activeIndex + 1]
      .filter((i) => i >= 0 && i < images.length)
      .map((i) => images[i]);
    if (neighbors.length) Image.prefetch(neighbors, "memory-disk");
  }, [visible, activeIndex, images]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setActiveIndex(idx);
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <FullScreenItem uri={item} placeholder={placeholders?.[index]} />
    ),
    [placeholders],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // Android back + iOS swipe
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.96)" }}>
        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 52,
            right: 16,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: 6,
          }}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Counter (একাধিক ছবি থাকলেই দেখাবে) */}
        {images.length > 1 && (
          <View
            style={{
              position: "absolute",
              top: 56,
              left: 16,
              zIndex: 10,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                {activeIndex + 1}/{images.length}
              </Text>
            </View>
          </View>
        )}

        {/* Full screen slider */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          initialNumToRender={1}
          windowSize={3}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          renderItem={renderItem}
        />

        {/* Dots */}
        {images.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 40,
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
                    i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default memo(ImageFullScreen);
