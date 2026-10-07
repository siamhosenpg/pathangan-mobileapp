import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MediaPreviewGrid, { MediaItem } from "./MediaPreviewGrid";

export type PostFieldKey = "title" | "text";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  text: string;
  setText: (v: string) => void;
  media: MediaItem[];
  onRemoveMedia: (i: number) => void;
  onPickMedia: () => void;
  isDark: boolean;
  /** ইনপুটে ফোকাস হলে প্যারেন্টকে জানায় (স্ক্রলের জন্য) */
  onFieldFocus?: (key: PostFieldKey) => void;
  onFieldBlur?: (key: PostFieldKey) => void;
  /** ইনপুটের y পজিশন প্যারেন্টকে জানায় */
  onFieldLayout?: (key: PostFieldKey, y: number) => void;
  /** বডি লিখতে লিখতে লাইন বাড়লে প্যারেন্টকে জানায় */
  onTextContentSizeChange?: () => void;
}

const ACCENT = "#00914d";

/* Body auto-grow settings
 * ফন্ট সাইজ ও লাইন হাইট className-এ আছে (text-base + leading-6 = 24px)।
 * leading-* বদলালে DESC_LINE_HEIGHT-ও একই মানে বদলাবেন।
 */
const BODY_LINE_HEIGHT = 24; // leading-6
const BODY_PADDING_V = 4; // py-1 (উপরে 4 + নিচে 4)
const BODY_MIN_LINES = 1;
const BODY_MAX_LINES = 10;
const BODY_MIN_HEIGHT = BODY_LINE_HEIGHT * BODY_MIN_LINES + BODY_PADDING_V * 2;
const BODY_MAX_HEIGHT = BODY_LINE_HEIGHT * BODY_MAX_LINES + BODY_PADDING_V * 2;

const NormalPostForm = ({
  title,
  setTitle,
  text,
  setText,
  media,
  onRemoveMedia,
  onPickMedia,
  isDark,
  onFieldFocus,
  onFieldBlur,
  onFieldLayout,
  onTextContentSizeChange,
}: Props) => {
  const { t } = useTranslation();
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";

  const handleLayout = (key: PostFieldKey) => (e: LayoutChangeEvent) => {
    onFieldLayout?.(key, e.nativeEvent.layout.y);
  };

  return (
    <View className="gap-2">
      {/* Title */}
      <View
        className="border-b border-border dark:border-dark-border"
        onLayout={handleLayout("title")}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          onFocus={() => onFieldFocus?.("title")}
          onBlur={() => onFieldBlur?.("title")}
          placeholder={t("postData.titlePlaceholder")}
          placeholderTextColor={ph}
          className="text-text dark:text-dark-text font-medium py-3"
        />
      </View>

      {/* Body (auto-grow: 1 line theke max 10 line) */}
      <View onLayout={handleLayout("text")}>
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => onFieldFocus?.("text")}
          onBlur={() => onFieldBlur?.("text")}
          onContentSizeChange={() => onTextContentSizeChange?.()}
          placeholder={t("postData.bodyPlaceholder")}
          placeholderTextColor={ph}
          multiline
          scrollEnabled
          textAlignVertical="top"
          style={{
            minHeight: BODY_MIN_HEIGHT,
            maxHeight: BODY_MAX_HEIGHT,
          }}
          className="py-1 leading-6 text-text dark:text-dark-text"
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
        className="flex-row items-center gap-3 w-5/6 py-1"
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
