import {
  useCreateCoursePostMutation,
  useCreatePostMutation,
  useCreateQuestionPostMutation,
} from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PostType = "post" | "question" | "course";

interface MediaPreview {
  uri: string;
  type: "image" | "video";
  fileName?: string;
  mimeType?: string;
}

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);

  const [activeType, setActiveType] = useState<PostType>("post");

  const [createPost, { isLoading: postLoading }] = useCreatePostMutation();
  const [createQuestion, { isLoading: questionLoading }] =
    useCreateQuestionPostMutation();
  const [createCourse, { isLoading: courseLoading }] =
    useCreateCoursePostMutation();
  const isLoading = postLoading || questionLoading || courseLoading;

  // NORMAL POST STATE
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">(
    "public",
  );
  const [media, setMedia] = useState<MediaPreview[]>([]);

  // QUESTION STATE
  const [questionText, setQuestionText] = useState("");
  const [questionTags, setQuestionTags] = useState("");

  // COURSE STATE
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseTags, setCourseTags] = useState("");
  const [courseMedia, setCourseMedia] = useState<MediaPreview[]>([]);

  const [error, setError] = useState("");

  const privacyOptions: { value: typeof privacy; label: string }[] = [
    { value: "public", label: "সবাই" },
    { value: "friends", label: "বন্ধুরা" },
    { value: "private", label: "শুধু আমি" },
  ];

  const tabs: {
    type: PostType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { type: "post", label: "পোস্ট", icon: "create-outline" },
    { type: "question", label: "প্রশ্ন", icon: "help-circle-outline" },
    { type: "course", label: "কোর্স", icon: "book-outline" },
  ];

  const pickMedia = async (target: "post" | "course") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (result.canceled) return;

    const selected: MediaPreview[] = result.assets.map((a) => ({
      uri: a.uri,
      type: a.type === "video" ? "video" : "image",
      fileName: a.fileName ?? undefined,
      mimeType: a.mimeType ?? undefined,
    }));

    if (target === "post") {
      const hasVideo = selected.some((m) => m.type === "video");
      const hasImage = selected.some((m) => m.type === "image");
      if (hasVideo && hasImage) {
        setError("ছবি এবং ভিডিও একসাথে দেওয়া যাবে না");
        return;
      }
      setError("");
      setMedia(selected);
    } else {
      const videos = selected.filter((m) => m.type === "video");
      if (videos.length > 1) {
        setError("একটির বেশি ভিডিও দেওয়া যাবে না");
        return;
      }
      setError("");
      setCourseMedia((prev) => [...prev, ...selected]);
    }
  };

  const buildFormData = (items: MediaPreview[], formData: FormData) => {
    items.forEach((m) => {
      formData.append("media", {
        uri: m.uri,
        name: m.fileName ?? `upload.${m.type === "video" ? "mp4" : "jpg"}`,
        type: m.mimeType ?? (m.type === "video" ? "video/mp4" : "image/jpeg"),
      } as any);
    });
  };

  const handleSubmit = async () => {
    setError("");
    try {
      if (activeType === "post") {
        if (!text.trim() && media.length === 0) {
          setError("কিছু একটা লিখুন অথবা ছবি/ভিডিও যোগ করুন");
          return;
        }
        const formData = new FormData();
        if (title.trim()) formData.append("title", title.trim());
        formData.append("text", text);
        formData.append("privacy", privacy);
        buildFormData(media, formData);
        await createPost(formData).unwrap();
      }

      if (activeType === "question") {
        if (!questionText.trim()) {
          setError("প্রশ্ন লিখুন");
          return;
        }
        await createQuestion({
          questionText: questionText.trim(),
          tags: questionTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          privacy,
        }).unwrap();
      }

      if (activeType === "course") {
        if (!courseTitle.trim()) {
          setError("কোর্সের শিরোনাম দিন");
          return;
        }
        const formData = new FormData();
        formData.append("title", courseTitle.trim());
        formData.append("description", courseDesc);
        formData.append("price", coursePrice || "0");
        formData.append("privacy", privacy);
        courseTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((tag) => formData.append("tags", tag));
        buildFormData(courseMedia, formData);
        await createCourse(formData).unwrap();
      }

      router.push("/(tabs)/feed" as any);
    } catch (err: any) {
      setError(err?.data?.message || "কিছু একটা সমস্যা হয়েছে");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + 12 }} className="px-4">
          {/* ===== HEADER ===== */}
          <View className="flex-row items-center gap-3 mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full items-center justify-center border border-border"
            >
              <Ionicons name="arrow-back" size={20} className="text-text" />
            </TouchableOpacity>
            <Text className="text-text text-lg font-bold flex-1">
              নতুন পোস্ট
            </Text>

            {/* Privacy toggle */}
            <View className="flex-row items-center gap-1 bg-white/5 border border-border rounded-full px-1 py-1">
              {privacyOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setPrivacy(opt.value)}
                  className={`px-3 py-1 rounded-full ${
                    privacy === opt.value ? "bg-accent" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      privacy === opt.value
                        ? "text-white"
                        : "text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ===== TABS ===== */}
          <View className="flex-row gap-2 mb-5 bg-white/5 border border-border rounded-xl p-1">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.type}
                onPress={() => {
                  setActiveType(tab.type);
                  setError("");
                }}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${
                  activeType === tab.type ? "bg-accent" : ""
                }`}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={activeType === tab.type ? "#fff" : "#888"}
                />
                <Text
                  className={`text-sm font-semibold ${
                    activeType === tab.type
                      ? "text-white"
                      : "text-text-secondary"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ===== USER ROW ===== */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-10 h-10 rounded-full overflow-hidden bg-accent/20 shrink-0 items-center justify-center">
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-accent font-bold text-base">
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text className="text-text text-sm font-medium">{user?.name}</Text>
          </View>

          {/* ===== ERROR ===== */}
          {error ? (
            <View className="flex-row items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl mb-4">
              <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
            </View>
          ) : null}

          {/* ===== NORMAL POST ===== */}
          {activeType === "post" && (
            <View className="gap-4">
              {/* title */}
              <View className="border border-border rounded-xl px-4 bg-white/5 focus-within:border-accent">
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="শিরোনাম লিখুন (ঐচ্ছিক)"
                  placeholderTextColor="#ffffff30"
                  className="text-text text-sm font-medium py-3.5"
                />
              </View>

              {/* text */}
              <View className="border border-border rounded-xl px-4 py-3 bg-white/5">
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="আপনার মনের কথা লিখুন..."
                  placeholderTextColor="#ffffff30"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="text-text text-sm"
                  style={{ minHeight: 100 }}
                />
              </View>

              {/* media preview */}
              {media.length > 0 && (
                <View
                  className={`gap-2 ${media.length === 1 ? "" : "flex-row flex-wrap"}`}
                >
                  {media.map((m, i) => (
                    <View
                      key={i}
                      style={{
                        width: media.length === 1 ? "100%" : "48.5%",
                        aspectRatio: 1,
                      }}
                      className="rounded-xl overflow-hidden bg-white/5"
                    >
                      <Image
                        source={{ uri: m.uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {m.type === "video" && (
                        <View className="absolute inset-0 items-center justify-center">
                          <Ionicons
                            name="play-circle"
                            size={40}
                            color="rgba(255,255,255,0.8)"
                          />
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() =>
                          setMedia((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* media upload */}
              <TouchableOpacity
                onPress={() => pickMedia("post")}
                className="flex-row items-center gap-2 py-1"
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  className="text-text-secondary"
                />
                <Text className="text-text-secondary text-sm">
                  ছবি / ভিডিও যোগ করুন
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== QUESTION POST ===== */}
          {activeType === "question" && (
            <View className="gap-4">
              <View className="border border-border rounded-xl px-4 py-3 bg-white/5">
                <TextInput
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder="আপনার প্রশ্নটি লিখুন..."
                  placeholderTextColor="#ffffff30"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-text text-sm"
                  style={{ minHeight: 90 }}
                />
              </View>

              <View className="gap-2">
                <Text className="text-text text-sm font-medium">ট্যাগ</Text>
                <View className="flex-row items-center border border-border rounded-xl px-4 bg-white/5 gap-3">
                  <Ionicons
                    name="pricetag-outline"
                    size={16}
                    className="text-text-secondary"
                  />
                  <TextInput
                    value={questionTags}
                    onChangeText={setQuestionTags}
                    placeholder="react, nextjs (কমা দিয়ে আলাদা করুন)"
                    placeholderTextColor="#ffffff30"
                    className="flex-1 text-text text-sm py-3.5"
                  />
                </View>
              </View>
            </View>
          )}

          {/* ===== COURSE POST ===== */}
          {activeType === "course" && (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-text text-sm font-medium">
                  কোর্সের শিরোনাম *
                </Text>
                <View className="border border-border rounded-xl px-4 bg-white/5">
                  <TextInput
                    value={courseTitle}
                    onChangeText={setCourseTitle}
                    placeholder="কোর্সের নাম লিখুন"
                    placeholderTextColor="#ffffff30"
                    className="text-text text-sm py-3.5"
                  />
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-text text-sm font-medium">বিবরণ</Text>
                <View className="border border-border rounded-xl px-4 py-3 bg-white/5">
                  <TextInput
                    value={courseDesc}
                    onChangeText={setCourseDesc}
                    placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..."
                    placeholderTextColor="#ffffff30"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="text-text text-sm"
                    style={{ minHeight: 90 }}
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 gap-2">
                  <Text className="text-text text-sm font-medium">
                    মূল্য (টাকা)
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-4 bg-white/5 gap-2">
                    <Text className="text-text-secondary text-sm">৳</Text>
                    <TextInput
                      value={coursePrice}
                      onChangeText={setCoursePrice}
                      placeholder="০"
                      placeholderTextColor="#ffffff30"
                      keyboardType="numeric"
                      className="flex-1 text-text text-sm py-3.5"
                    />
                  </View>
                </View>

                <View className="flex-1 gap-2">
                  <Text className="text-text text-sm font-medium">ট্যাগ</Text>
                  <View className="border border-border rounded-xl px-4 bg-white/5">
                    <TextInput
                      value={courseTags}
                      onChangeText={setCourseTags}
                      placeholder="react, nextjs"
                      placeholderTextColor="#ffffff30"
                      className="text-text text-sm py-3.5"
                    />
                  </View>
                </View>
              </View>

              {/* course media preview */}
              {courseMedia.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {courseMedia.map((m, i) => (
                    <View
                      key={i}
                      style={{ width: "48.5%", aspectRatio: 1 }}
                      className="rounded-xl overflow-hidden bg-white/5"
                    >
                      <Image
                        source={{ uri: m.uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {m.type === "video" && (
                        <View className="absolute inset-0 items-center justify-center">
                          <Ionicons
                            name="play-circle"
                            size={40}
                            color="rgba(255,255,255,0.8)"
                          />
                        </View>
                      )}
                      <View className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full">
                        <Text className="text-white text-xs">
                          {m.type === "video" ? "ভিডিও" : "ছবি"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          setCourseMedia((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={() => pickMedia("course")}
                className="flex-row items-center gap-2 py-1"
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  className="text-text-secondary"
                />
                <Text className="text-text-secondary text-sm">
                  ছবি / ভিডিও যোগ করুন
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== SUBMIT ===== */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="mt-6 w-full py-4 rounded-xl bg-accent items-center justify-center"
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-sm">
                  পোস্ট হচ্ছে...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-sm">
                পোস্ট করুন
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
