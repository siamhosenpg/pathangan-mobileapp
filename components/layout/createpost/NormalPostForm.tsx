import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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

const ACCENT = "#00914d";

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
  const { t } = useTranslation();
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";
  const bg = "bg-background-secondary dark:bg-dark-background-secondary";
  const border = "border border-border dark:border-dark-border";

  return (
    <View className="gap-2">
      {/* Title */}
      <View className={` border-b border-border dark:border-dark-border   `}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t("postData.titlePlaceholder")}
          placeholderTextColor={ph}
          className="text-text dark:text-dark-text  font-medium py-3"
        />
      </View>

      {/* Body */}
      <View className={`   py-1`}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t("postData.bodyPlaceholder")}
          placeholderTextColor={ph}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="text-text dark:text-dark-text "
          style={{ minHeight: 140 }}
        />
      </View>

      {/* Media preview */}
      <MediaPreviewGrid media={media} onRemove={onRemoveMedia} />

      {/* Pick media */}
      <TouchableOpacity
        onPress={onPickMedia}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t("postData.addMedia")}
        className={`flex-row items-center gap-3 w-5/6 py-1  `}
      >
        <View className="w-8 h-8 rounded-xl bg-accent/10 items-center justify-center">
          <Ionicons name="image-outline" size={18} color={ACCENT} />
        </View>
        <Text className="text-text-tertiary text-sm dark:text-dark-text-tertiary font-semibold flex-1">
          {t("postData.addMedia")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NormalPostForm;
