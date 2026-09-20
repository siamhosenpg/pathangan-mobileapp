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

const CATEGORIES: { value: HandoutCategory; label: string }[] = [
  { value: "golpo", label: "গল্প" },
  { value: "itihash", label: "ইতিহাস" },
  { value: "dharmiyo", label: "ধর্মীয়" },
  { value: "kobita", label: "কবিতা" },
  { value: "ovizoggota", label: "অভিজ্ঞতা" },
  { value: "onnanno", label: "অন্যান্য" },
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

const getMimeType = (ext: string) =>
  ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

export default function EditHandoutScreen() {
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

  // Server theke ashа original value, change hoyeche kina bujhar jonno
  const [original, setOriginal] = useState<{
    title: string;
    description: string;
    category: HandoutCategory;
  } | null>(null);

  const hasLoadedRef = useRef(false);
  // Save successful hole popup skip korar jonno
  const allowLeaveRef = useRef(false);

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
        "পরিবর্তন বাতিল করবেন?",
        "আপনার করা পরিবর্তন সংরক্ষিত হয়নি। এখন বেরিয়ে গেলে সব মুছে যাবে।",
        [
          { text: "থাকুন", style: "cancel" },
          {
            text: "বাদ দিন",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

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
      Alert.alert("সমস্যা হয়েছে", "ছবি নির্বাচন করা যায়নি, আবার চেষ্টা করুন");
    }
  };

  /* ─────────── Save ─────────── */
  const handleSave = async () => {
    if (isSaving) return;

    if (!title.trim()) {
      Alert.alert("শিরোনাম দিন", "হ্যান্ডআউটের একটি শিরোনাম আবশ্যক");
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
      Alert.alert("সফল!", "হ্যান্ডআউট আপডেট হয়েছে", [
        { text: "ঠিক আছে", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.log("HANDOUT UPDATE ERROR:", JSON.stringify(error, null, 2));
      Alert.alert("সমস্যা হয়েছে", "আপডেট করা যায়নি, আবার চেষ্টা করুন");
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
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          হ্যান্ডআউট এডিট করুন
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        >
          {/* Cover Image */}
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.85}
            className="w-40 aspect-[2/3] rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-dashed border-border dark:border-dark-border items-center justify-center"
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center gap-2">
                <Ionicons
                  name="image-outline"
                  size={28}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                  কভার ছবি যোগ করুন
                </Text>
              </View>
            )}
            <View className="absolute bottom-2 right-2 bg-black/60 rounded-full p-2">
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Title */}
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
              শিরোনাম
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="হ্যান্ডআউটের নাম লিখুন"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className="bg-background-secondary dark:bg-dark-background-secondary rounded-xl px-4 py-3 text-sm text-text dark:text-dark-text"
            />
          </View>

          {/* Description */}
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
              বিবরণ
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="সংক্ষিপ্ত বিবরণ লিখুন"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-background-secondary dark:bg-dark-background-secondary rounded-xl px-4 py-3 text-sm text-text dark:text-dark-text min-h-[100px]"
            />
          </View>

          {/* Category */}
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
              ক্যাটাগরি
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  className={`px-4 py-2 rounded-full border ${
                    category === c.value
                      ? "bg-accent border-accent"
                      : "border-border dark:border-dark-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      category === c.value
                        ? "text-white"
                        : "text-text-secondary dark:text-dark-text-secondary"
                    }`}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Save button (keyboard er upore thake) */}
        <View className="px-5 pb-3 pt-2 border-t border-border dark:border-dark-border">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className="bg-accent rounded-xl py-4 items-center justify-center flex-row gap-2"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                সংরক্ষণ করুন
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
