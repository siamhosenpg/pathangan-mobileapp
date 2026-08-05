import {
  useGetHandoutBySlugQuery,
  useUpdateHandoutMutation,
} from "@/redux/api/handout/handoutApi";
import { HandoutCategory } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function EditHandoutScreen() {
  const { handoutId } = useLocalSearchParams<{ handoutId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data, isLoading } = useGetHandoutBySlugQuery(handoutId ?? "", {
    skip: !handoutId,
  });
  const [updateHandout, { isLoading: isSaving }] = useUpdateHandoutMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HandoutCategory>("onnanno");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [newCoverPicked, setNewCoverPicked] = useState(false);

  // ── existing data দিয়ে form fill ─────────────────────
  useEffect(() => {
    if (data?.data) {
      setTitle(data.data.title);
      setDescription(data.data.description);
      setCategory(data.data.category);
      setCoverImage(data.data.coverImage);
    }
  }, [data]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
      setNewCoverPicked(true);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("শিরোনাম দিন", "হ্যান্ডআউটের একটি শিরোনাম আবশ্যক");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);

    if (newCoverPicked && coverImage) {
      const filename = coverImage.split("/").pop() ?? "cover.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("coverImage", {
        uri: coverImage,
        name: filename,
        type,
      } as any);
    }

    try {
      await updateHandout({ id: handoutId!, formData }).unwrap();
      Alert.alert("সফল!", "হ্যান্ডআউট আপডেট হয়েছে", [
        { text: "ঠিক আছে", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("সমস্যা হয়েছে", "আপডেট করা যায়নি");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        {/* Cover Image */}
        <TouchableOpacity
          onPress={handlePickImage}
          activeOpacity={0.85}
          className="h-40 rounded-xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary items-center justify-center"
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

      <View className="px-5 pb-5 pt-2 border-t border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="bg-accent rounded-xl py-4 items-center justify-center flex-row gap-2"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">সংরক্ষণ করুন</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
