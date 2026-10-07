import { useCreateHandoutMutation } from "@/redux/api/handout/handoutApi";
import type { HandoutCategory } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useNavigation } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_KEYS: HandoutCategory[] = [
  "golpo",
  "itihash",
  "dharmiyo",
  "kobita",
  "ovizoggota",
  "onnanno",
];

const SAFE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/**
 * uri theke safe extension ber kori.
 * HEIC/unknown hole "jpg" (Compatible mode e ager theke JPEG hoye ashe).
 */
const getSafeExtension = (uri: string) => {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  return ext && SAFE_IMAGE_EXTENSIONS.includes(ext) ? ext : "jpg";
};

const inputClass = " py-3   text-text dark:text-dark-text ";

/* Description auto-grow settings
 * শুধু উচ্চতা হিসাবের জন্য। ফন্ট সাইজ এবং লাইন হাইট className-এ আছে।
 * className-এর leading-6 = 24px, তাই এখানেও 24 রাখা হয়েছে।
 * leading-* বদলালে এই মানও বদলাতে হবে।
 */
const DESC_LINE_HEIGHT = 24; // leading-6
const DESC_PADDING_V = 12; // py-3 (উপরে 12 + নিচে 12)
const DESC_MIN_LINES = 1;
const DESC_MAX_LINES = 10;
const DESC_MIN_HEIGHT = DESC_LINE_HEIGHT * DESC_MIN_LINES + DESC_PADDING_V * 2;
const DESC_MAX_HEIGHT = DESC_LINE_HEIGHT * DESC_MAX_LINES + DESC_PADDING_V * 2;

/* কিবোর্ড খোলা অবস্থায় স্ক্রলের জন্য বাড়তি জায়গা */
const KEYBOARD_EXTRA_SPACE = 320;
/* ফোকাস করা ফিল্ড স্ক্রিনের উপর থেকে কতটা নিচে দেখাবে */
const SCROLL_TOP_OFFSET = 90;

type FieldKey = "title" | "description" | "tags";

export default function CreateHandoutScreen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HandoutCategory | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);

  const [createHandout, { isLoading }] = useCreateHandoutMutation();

  // Submit successful hole confirm popup skip korar jonno
  const allowLeaveRef = useRef(false);

  /* ─────────── Keyboard scroll ─────────── */
  const scrollRef = useRef<ScrollView>(null);
  const fieldYRef = useRef<Record<FieldKey, number>>({
    title: 0,
    description: 0,
    tags: 0,
  });
  const focusedFieldRef = useRef<FieldKey | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleFieldLayout = (key: FieldKey) => (e: LayoutChangeEvent) => {
    fieldYRef.current[key] = e.nativeEvent.layout.y;
  };

  const scrollToField = useCallback((key: FieldKey, delay = 0) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(fieldYRef.current[key] - SCROLL_TOP_OFFSET, 0),
        animated: true,
      });
    }, delay);
  }, []);

  const handleFocus = (key: FieldKey) => () => {
    focusedFieldRef.current = key;
    // আগে বাড়তি প্যাডিং বসাই, তারপর স্ক্রল করি
    setIsInputFocused(true);
    scrollToField(key, 150);
    // কিবোর্ড পুরো খোলার পর আরেকবার ঠিক করে নিই
    scrollToField(key, 400);
  };

  const handleBlur = (key: FieldKey) => () => {
    if (focusedFieldRef.current === key) {
      focusedFieldRef.current = null;
      setIsInputFocused(false);
    }
  };

  const placeholderColor = isDark ? "#8a8a8a" : "#6d6d6d";

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput],
  );

  const hasUnsavedChanges =
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    tagsInput.trim().length > 0 ||
    category !== null ||
    coverImageUri !== null;

  /* ─────────── Back confirmation ─────────── */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current || !hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        t("handoutData.discardTitle"),
        t("handoutData.discardCreateMessage"),
        [
          { text: t("handoutData.stay"), style: "cancel" },
          {
            text: t("handoutData.discard"),
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, t]);

  /* ─────────── Cover image ─────────── */
  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
        exif: false,
        // iPhone er HEIC file auto JPG kore dey
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        t("handoutData.errorTitle"),
        t("handoutData.pickImageFailed"),
      );
    }
  };

  /* ─────────── Submit ─────────── */
  const handleSubmit = async () => {
    if (isLoading) return;

    if (!title.trim() || !description.trim() || !category) {
      Alert.alert(
        t("handoutData.incompleteTitle"),
        t("handoutData.incompleteMessage"),
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("tags", JSON.stringify(parsedTags));

      if (coverImageUri) {
        const ext = getSafeExtension(coverImageUri);
        const fileName = `handout-cover-${Date.now()}.${ext}`;
        const file = new File(coverImageUri);
        formData.append("coverImage", file, fileName);
      }

      const res = await createHandout(formData).unwrap();

      // popup na dekhiye niche jete dao
      allowLeaveRef.current = true;
      router.replace(`/handouts/manage/${res.data._id}`);
    } catch (error) {
      console.log("HANDOUT CREATE ERROR:", JSON.stringify(error, null, 2));
      Alert.alert(t("handoutData.errorTitle"), t("handoutData.createFailed"));
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* টপ বার */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          {t("handoutData.newHandout")}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 20,
            gap: 20,
            // কিবোর্ড খোলা থাকলে নিচে বাড়তি জায়গা, যাতে স্ক্রল করা যায়
            paddingBottom: 40 + (isInputFocused ? KEYBOARD_EXTRA_SPACE : 0),
          }}
        >
          {/* কভার ইমেজ */}
          <TouchableOpacity
            onPress={pickCoverImage}
            activeOpacity={0.85}
            className=" w-32 aspect-[2/3] rounded-2xl bg-background-secondary dark:bg-dark-background-secondary border border-dashed border-border dark:border-dark-border items-center justify-center overflow-hidden"
          >
            {coverImageUri ? (
              <>
                <Image
                  source={{ uri: coverImageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2.5 right-2.5 bg-black/60 rounded-full p-2">
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                </View>
              </>
            ) : (
              <View className="items-center gap-2.5 px-3">
                <View className="w-14 h-14 rounded-full bg-accent/10 items-center justify-center">
                  <Ionicons name="image-outline" size={26} color="#00914d" />
                </View>
                <Text className="text-sm text-center font-medium text-text-tertiary dark:text-dark-text-tertiary">
                  {t("handoutData.coverAdd")}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* টাইটেল */}
          <View className="gap-2" onLayout={handleFieldLayout("title")}>
            <Text className=" font-bold text-text dark:text-dark-text ">
              {t("handoutData.fieldTitle")}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              onFocus={handleFocus("title")}
              onBlur={handleBlur("title")}
              placeholder={t("handoutData.titlePlaceholder")}
              placeholderTextColor={placeholderColor}
              className={` border-b font-semibold border-border dark:border-dark-border ${inputClass}`}
            />
          </View>

          {/* বর্ণনা (auto-grow: 1 line theke max 10 line) */}
          <View className="gap-2" onLayout={handleFieldLayout("description")}>
            <Text className=" font-bold text-text dark:text-dark-text">
              {t("handoutData.fieldDescription")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              onFocus={handleFocus("description")}
              onBlur={handleBlur("description")}
              onContentSizeChange={() => {
                // লিখতে লিখতে লাইন বাড়লে আবার ঠিক জায়গায় স্ক্রল করি
                if (focusedFieldRef.current === "description") {
                  scrollToField("description", 50);
                }
              }}
              placeholder={t("handoutData.descriptionPlaceholder")}
              placeholderTextColor={placeholderColor}
              multiline
              textAlignVertical="top"
              scrollEnabled
              style={{
                minHeight: DESC_MIN_HEIGHT,
                maxHeight: DESC_MAX_HEIGHT,
              }}
              className="py-3  leading-6 font-medium text-text dark:text-dark-text"
            />
          </View>

          {/* ক্যাটাগরি */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text px-1">
              {t("handoutData.fieldCategory")}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_KEYS.map((key) => {
                const isActive = category === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setCategory(key)}
                    activeOpacity={0.8}
                    className={`px-4 py-2 rounded-full border ${
                      isActive
                        ? "bg-accent border-accent"
                        : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-white"
                          : "text-text-secondary dark:text-dark-text-secondary"
                      }`}
                    >
                      {t(`handoutData.categories.${key}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ট্যাগ */}
          <View className="gap-2" onLayout={handleFieldLayout("tags")}>
            <Text className="text-sm font-semibold text-text dark:text-dark-text ">
              {t("handoutData.fieldTags")}
            </Text>
            <TextInput
              value={tagsInput}
              onChangeText={setTagsInput}
              onFocus={handleFocus("tags")}
              onBlur={handleBlur("tags")}
              placeholder={t("handoutData.tagsPlaceholder")}
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              className={inputClass}
            />
            {parsedTags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 px-1">
                {parsedTags.map((tag, i) => (
                  <View
                    key={`${tag}-${i}`}
                    className="bg-accent/10 px-2.5 py-1 rounded-full"
                  >
                    <Text className="text-accent text-xs font-medium">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* সাবমিট বাটন */}
        <View className="px-5 pb-3 pt-2 border-t border-border dark:border-dark-border">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-4 items-center justify-center flex-row gap-2"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text className="text-white font-bold text-base">
                  {t("handoutData.nextStep")}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
