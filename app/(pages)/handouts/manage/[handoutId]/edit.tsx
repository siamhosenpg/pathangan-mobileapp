import {
  useGetHandoutBySlugQuery,
  useUpdateHandoutMutation,
} from "@/redux/api/handout/handoutApi";
import { HandoutCategory } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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

const inputClass =
  "px-4 py-3.5 rounded-2xl bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text border border-border dark:border-dark-border";

export default function EditHandoutScreen() {
  const { t } = useTranslation();
  const { handoutId } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();

  const { data, isLoading } = useGetHandoutBySlugQuery(handoutId ?? "", {
    skip: !handoutId,
  });
  const [updateHandout, { isLoading: isSaving }] = useUpdateHandoutMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HandoutCategory>("onnanno");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [newCoverPicked, setNewCoverPicked] = useState(false);

  // Server theke asha original value, change hoyeche kina bujhar jonno
  const [original, setOriginal] = useState<{
    title: string;
    description: string;
    category: HandoutCategory;
  } | null>(null);

  const hasLoadedRef = useRef(false);
  // Save successful hole popup skip korar jonno
  const allowLeaveRef = useRef(false);

  const placeholderColor = isDark ? "#6b7280" : "#9ca3af";

  /* ─────────── Existing data diye form fill (shudhu ekbar) ─────────── */
  useEffect(() => {
    if (!data?.data || hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    const h = data.data;

    setTitle(h.title);
    setDescription(h.description ?? "");
    setCategory(h.category);
    setCoverImage(h.coverImage ?? null);
    setOriginal({
      title: h.title,
      description: h.description ?? "",
      category: h.category,
    });
  }, [data]);

  const hasUnsavedChanges =
    original !== null &&
    (title.trim() !== original.title.trim() ||
      description.trim() !== original.description.trim() ||
      category !== original.category ||
      newCoverPicked);

  /* ─────────── Back confirmation ─────────── */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current || !hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        t("handoutData.discardTitle"),
        t("handoutData.discardEditMessage"),
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
  const handlePickImage = async () => {
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
        setCoverImage(result.assets[0].uri);
        setNewCoverPicked(true);
      }
    } catch {
      Alert.alert(
        t("handoutData.errorTitle"),
        t("handoutData.pickImageFailed"),
      );
    }
  };

  /* ─────────── Save ─────────── */
  const handleSave = async () => {
    if (isSaving) return;

    if (!title.trim()) {
      Alert.alert(
        t("handoutData.titleRequiredTitle"),
        t("handoutData.titleRequiredMessage"),
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);

      if (newCoverPicked && coverImage) {
        const ext = getSafeExtension(coverImage);
        const fileName = `handout-cover-${Date.now()}.${ext}`;
        const file = new File(coverImage);
        formData.append("coverImage", file, fileName);
      }

      await updateHandout({ id: handoutId!, formData }).unwrap();

      // popup na dekhiye back jete dao
      allowLeaveRef.current = true;
      Alert.alert(t("handoutData.success"), t("handoutData.updateSuccess"), [
        { text: t("handoutData.ok"), onPress: () => router.back() },
      ]);
    } catch (error) {
      console.log("HANDOUT UPDATE ERROR:", JSON.stringify(error, null, 2));
      Alert.alert(t("handoutData.errorTitle"), t("handoutData.updateFailed"));
    }
  };

  /* ─────────── Loading ─────────── */
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

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
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          {t("handoutData.editHandout")}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
        >
          {/* Cover Image */}
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.85}
            className="self-center w-44 aspect-[2/3] rounded-3xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-dashed border-border dark:border-dark-border items-center justify-center"
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
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
            <View className="absolute bottom-2.5 right-2.5 bg-black/60 rounded-full p-2">
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Title */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text px-1">
              {t("handoutData.fieldTitle")}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t("handoutData.titlePlaceholder")}
              placeholderTextColor={placeholderColor}
              className={inputClass}
            />
          </View>

          {/* Description */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text px-1">
              {t("handoutData.fieldDescription")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t("handoutData.descriptionPlaceholder")}
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className={`${inputClass} min-h-[110px]`}
            />
          </View>

          {/* Category */}
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
        </ScrollView>

        {/* Save button */}
        <View className="px-5 pb-3 pt-2 border-t border-border dark:border-dark-border">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-4 items-center justify-center flex-row gap-2"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {t("handoutData.save")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
