import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import MediaPreviewGrid, { MediaItem } from "./MediaPreviewGrid";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  text: string;
  setText: (v: string) => void;
  media: MediaItem[];
  onRemoveMedia: (i: number) => void;
  onPickMedia: () => void;
  isDark: boolean;
}

const NormalPostForm = ({
  title,
  setTitle,
  text,
  setText,
  media,
  onRemoveMedia,
  onPickMedia,
  isDark,
}: Props) => {
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";
  const bg = "bg-background-secondary dark:bg-dark-background-secondary";
  const border = "border border-border dark:border-dark-border";

  return (
    <View className="gap-4">
      {/* Title */}
      <View className={`${border} ${bg} rounded-2xl px-4`}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="শিরোনাম লিখুন (ঐচ্ছিক)"
          placeholderTextColor={ph}
          className="text-text dark:text-dark-text text-sm font-medium py-3.5"
        />
      </View>

      {/* Body */}
      <View className={`${border} ${bg} rounded-2xl px-4 py-3`}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="আপনার মনের কথা লিখুন..."
          placeholderTextColor={ph}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="text-text dark:text-dark-text text-sm"
          style={{ minHeight: 110 }}
        />
      </View>

      {/* Media preview */}
      <MediaPreviewGrid media={media} onRemove={onRemoveMedia} />

      {/* Pick media */}
      <TouchableOpacity
        onPress={onPickMedia}
        className={`flex-row items-center gap-3 px-4 py-3.5 rounded-2xl ${border} ${bg}`}
      >
        <View className="w-8 h-8 rounded-xl bg-accent/10 items-center justify-center">
          <Ionicons name="image-outline" size={18} color="#6366f1" />
        </View>
        <Text className="text-text-secondary dark:text-dark-text-secondary text-sm flex-1">
          ছবি বা ভিডিও যোগ করুন
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "#555" : "#bbb"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default NormalPostForm;
