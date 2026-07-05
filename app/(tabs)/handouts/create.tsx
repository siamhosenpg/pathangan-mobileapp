import { useCreateHandoutMutation } from "@/redux/api/handout/handoutApi";
import type { HandoutCategory } from "@/types/handoutTypes";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
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

export default function CreateHandoutScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HandoutCategory | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);

  const [createHandout, { isLoading }] = useCreateHandoutMutation();

  const pickCoverImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "অনুমতি প্রয়োজন",
        "ছবি নির্বাচন করতে গ্যালারি অ্যাক্সেস দিন",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [2, 3],
      quality: 0.9,
    });
    if (!result.canceled) {
      setCoverImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
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
        .map((t) => t.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tags));

      if (coverImageUri) {
        const filename = coverImageUri.split("/").pop() ?? "cover.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("coverImage", {
          uri: coverImageUri,
          name: filename,
          type,
        } as any);
      }

      const res = await createHandout(formData).unwrap();

      router.replace(`/handouts/manage/${res.data._id}`);
    } catch (error) {
      Alert.alert(
        "সমস্যা হয়েছে",
        "হ্যান্ডআউট তৈরি করা যায়নি, আবার চেষ্টা করুন",
      );
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
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
          contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 60 }}
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
      </KeyboardAvoidingView>

      {/* সাবমিট বাটন */}
      <View className="px-5 pb-5 pt-2 border-t border-border dark:border-dark-border">
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
    </SafeAreaView>
  );
}
