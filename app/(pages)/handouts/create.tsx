import { useCreateHandoutMutation } from "@/redux/api/handout/handoutApi";
import type { HandoutCategory } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useNavigation } from "expo-router";
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

const categoryOptions: { key: HandoutCategory; label: string }[] = [
  { key: "golpo", label: "গল্প" },
  { key: "itihash", label: "ইতিহাস" },
  { key: "dharmiyo", label: "ধর্মীয়" },
  { key: "kobita", label: "কবিতা" },
  { key: "ovizoggota", label: "অভিজ্ঞতা" },
  { key: "onnanno", label: "অন্যান্য" },
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

export default function CreateHandoutScreen() {
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

  const hasUnsavedChanges =
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    tagsInput.trim().length > 0 ||
    category !== null ||
    coverImageUri !== null;

  /* ─────────── Back confirmation ───────────
   * beforeRemove: close button, Android back, iOS swipe-back,
   * router.back() shob ekhane atkay.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current || !hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        "পরিবর্তন বাতিল করবেন?",
        "আপনার লেখা তথ্য সংরক্ষিত হয়নি। এখন বেরিয়ে গেলে সব মুছে যাবে।",
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
  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
        exif: false,
        // iPhone er HEIC file auto JPG kore dey (create post page e jemon)
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("সমস্যা হয়েছে", "ছবি নির্বাচন করা যায়নি, আবার চেষ্টা করুন");
    }
  };

  /* ─────────── Submit ─────────── */
  const handleSubmit = async () => {
    if (isLoading) return;

    if (!title.trim() || !description.trim() || !category) {
      Alert.alert(
        "তথ্য অসম্পূর্ণ",
        "টাইটেল, বর্ণনা ও ক্যাটাগরি অবশ্যই দিতে হবে",
      );
      return;
    }

    try {
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tags));

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
      Alert.alert(
        "সমস্যা হয়েছে",
        "হ্যান্ডআউট তৈরি করা যায়নি, আবার চেষ্টা করুন",
      );
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
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-text dark:text-dark-text mr-9">
          নতুন হ্যান্ডআউট
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}
        >
          {/* কভার ইমেজ */}
          <TouchableOpacity
            onPress={pickCoverImage}
            activeOpacity={0.8}
            className="w-40 aspect-[2/3] rounded-2xl bg-background-secondary dark:bg-dark-background-secondary border border-dashed border-border dark:border-dark-border items-center justify-center overflow-hidden"
          >
            {coverImageUri ? (
              <Image
                source={{ uri: coverImageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center gap-2">
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={isDark ? "#8a8a8a" : "#6d6d6d"}
                />
                <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
                  কভার ইমেজ যোগ করুন
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* টাইটেল */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              টাইটেল
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="হ্যান্ডআউটের নাম লিখুন"
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              className="px-4 py-3 rounded-xl bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text border border-border dark:border-dark-border"
            />
          </View>

          {/* বর্ণনা */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              সংক্ষিপ্ত বর্ণনা
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="এই হ্যান্ডআউট সম্পর্কে সংক্ষেপে লিখুন"
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="px-4 py-3 rounded-xl bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text border border-border dark:border-dark-border min-h-[100px]"
            />
          </View>

          {/* ক্যাটাগরি */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              ক্যাটাগরি
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categoryOptions.map((opt) => {
                const isActive = category === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setCategory(opt.key)}
                    className={`px-4 py-2 rounded-full border ${
                      isActive
                        ? "bg-accent border-accent"
                        : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-white"
                          : "text-text-secondary dark:text-dark-text-secondary"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ট্যাগ */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              ট্যাগ (কমা দিয়ে আলাদা করুন)
            </Text>
            <TextInput
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="যেমনঃ ইতিহাস, বদর, ইসলাম"
              placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
              className="px-4 py-3 rounded-xl bg-background-secondary dark:bg-dark-background-secondary text-text dark:text-dark-text border border-border dark:border-dark-border"
            />
          </View>
        </ScrollView>

        {/* সাবমিট বাটন (KeyboardAvoidingView er vitore, tai keyboard er upore thake) */}
        <View className="px-5 pb-3 pt-2 border-t border-border dark:border-dark-border">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="bg-accent rounded-xl py-4 items-center justify-center flex-row gap-2"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text className="text-white font-bold text-base">
                  পরবর্তী ধাপ
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
