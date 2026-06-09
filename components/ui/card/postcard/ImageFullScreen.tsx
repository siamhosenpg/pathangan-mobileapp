// ImageFullScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  images: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ImageFullScreen = ({ images, initialIndex, visible, onClose }: Props) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
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

        {/* Counter */}
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
          />
        </View>

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
          onViewableItemsChanged={({ viewableItems }) => {
            const idx = viewableItems[0]?.index;
            if (idx != null) setActiveIndex(idx);
          }}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <View
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: item }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                resizeMode="contain"
              />
            </View>
          )}
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

export default ImageFullScreen;
