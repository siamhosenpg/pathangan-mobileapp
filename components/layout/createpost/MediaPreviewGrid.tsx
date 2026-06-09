import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

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

const MediaPreviewGrid = ({ media, onRemove }: Props) => {
  if (media.length === 0) return null;

  return (
    <View className={`gap-2 ${media.length === 1 ? "" : "flex-row flex-wrap"}`}>
      {media.map((m, i) => (
        <View
          key={i}
          style={{
            width: media.length === 1 ? "100%" : "48.5%",
            aspectRatio: m.type === "video" && media.length === 1 ? 16 / 9 : 1,
          }}
          className="rounded-2xl overflow-hidden bg-background-tertiary dark:bg-dark-background-tertiary"
        >
          {/* thumbnail or image */}
          <Image
            source={{ uri: m.thumbnail ?? m.uri }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* video overlay */}
          {m.type === "video" && (
            <>
              <View className="absolute inset-0 bg-black/30 items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="play" size={22} color="#fff" />
                </View>
              </View>
              <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="videocam" size={11} color="#fff" />
                <Text className="text-white text-xs font-medium">ভিডিও</Text>
              </View>
            </>
          )}

          {/* image count badge */}
          {m.type === "image" && media.length > 1 && i === 0 && (
            <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full flex-row items-center gap-1">
              <Ionicons name="images" size={11} color="#fff" />
              <Text className="text-white text-xs">{media.length}</Text>
            </View>
          )}

          {/* remove button */}
          <TouchableOpacity
            onPress={() => onRemove(i)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
          >
            <Ionicons name="close" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default MediaPreviewGrid;
