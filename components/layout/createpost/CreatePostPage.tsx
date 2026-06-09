import {
  useCreateCoursePostMutation,
  useCreatePostMutation,
  useCreateQuestionPostMutation,
} from "@/redux/api/postApi";
import {
  failUpload,
  finishUpload,
  setProgress,
  startUpload,
} from "@/redux/features/upload/uploadSlice";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import CoursePostForm from "./CoursePostForm";
import { MediaItem } from "./MediaPreviewGrid";
import NormalPostForm from "./NormalPostForm";
import PostTypeSelector from "./PostTypeSelector";
import PrivacySelector from "./PrivacySelector";
import QuestionPostForm from "./QuestionPostForm";

type PostType = "post" | "question" | "course";

export default function CreatePostPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useDispatch();

  const [activeType, setActiveType] = useState<PostType>("post");
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">(
    "public",
  );
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [questionText, setQuestionText] = useState("");
  const [questionTags, setQuestionTags] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseTags, setCourseTags] = useState("");
  const [courseMedia, setCourseMedia] = useState<MediaItem[]>([]);

  const [createPost] = useCreatePostMutation();
  const [createQuestion] = useCreateQuestionPostMutation();
  const [createCourse] = useCreateCoursePostMutation();

  const pickMedia = async (target: "post" | "course") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.85,
      exif: false,
    });
    if (result.canceled) return;

    const selected: MediaItem[] = result.assets.map((a) => ({
      uri: a.uri,
      type: a.type === "video" ? "video" : "image",
      fileName: a.fileName ?? undefined,
      mimeType: a.mimeType ?? undefined,
      thumbnail: a.type === "video" ? (a.uri ?? undefined) : undefined,
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

  const buildFormData = (items: MediaItem[], formData: FormData) => {
    items.forEach((m) => {
      const ext = m.uri.split(".").pop()?.toLowerCase();
      const mimeType =
        m.mimeType ||
        (m.type === "video"
          ? "video/mp4"
          : ext === "png"
            ? "image/png"
            : "image/jpeg");
      const fileName =
        m.fileName || `upload.${m.type === "video" ? "mp4" : ext || "jpg"}`;
      formData.append("media", {
        uri: m.uri,
        name: fileName,
        type: mimeType,
      } as any);
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (activeType === "post" && !text.trim() && media.length === 0) {
      setError("কিছু একটা লিখুন অথবা ছবি/ভিডিও যোগ করুন");
      return;
    }
    if (activeType === "question" && !questionText.trim()) {
      setError("প্রশ্ন লিখুন");
      return;
    }
    if (activeType === "course" && !courseTitle.trim()) {
      setError("কোর্সের শিরোনাম দিন");
      return;
    }

    // ✅ সাথে সাথে feed-এ চলে যাও
    router.push("/(tabs)/feed" as any);

    // ✅ background upload শুরু
    dispatch(startUpload());

    const hasMedia =
      (activeType === "post" && media.length > 0) ||
      (activeType === "course" && courseMedia.length > 0);

    let fakeProgress = 0;
    const increment = hasMedia ? 1.5 : 8;
    const interval = setInterval(() => {
      fakeProgress += increment;
      if (fakeProgress < 85) {
        dispatch(setProgress(Math.round(fakeProgress)));
      } else {
        clearInterval(interval);
      }
    }, 200);

    try {
      if (activeType === "post") {
        const formData = new FormData();
        if (title.trim()) formData.append("title", title.trim());
        formData.append("text", text);
        formData.append("privacy", privacy);
        buildFormData(media, formData);
        await createPost(formData).unwrap();
      }

      if (activeType === "question") {
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

      clearInterval(interval);
      dispatch(setProgress(100));
      dispatch(finishUpload());
    } catch (err: any) {
      clearInterval(interval);
      dispatch(failUpload());
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-background dark:bg-dark-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + 12 }} className="px-4 gap-5">
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full items-center justify-center border border-border dark:border-dark-border"
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={isDark ? "#f1f1f1" : "#1b1b1b"}
              />
            </TouchableOpacity>
            <Text className="text-text dark:text-dark-text text-lg font-bold flex-1">
              নতুন পোস্ট
            </Text>
          </View>

          {/* Type selector */}
          <PostTypeSelector
            active={activeType}
            onChange={(t) => {
              setActiveType(t);
              setError("");
            }}
            isDark={isDark}
          />

          {/* User row */}
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full overflow-hidden bg-accent/20 items-center justify-center">
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
            <View>
              <Text className="text-text dark:text-dark-text text-sm font-semibold">
                {user?.name}
              </Text>
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                @{user?.username}
              </Text>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View className="flex-row items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-2xl">
              <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Forms */}
          {activeType === "post" && (
            <NormalPostForm
              title={title}
              setTitle={setTitle}
              text={text}
              setText={setText}
              media={media}
              onRemoveMedia={(i) =>
                setMedia((prev) => prev.filter((_, j) => j !== i))
              }
              onPickMedia={() => pickMedia("post")}
              isDark={isDark}
            />
          )}

          {activeType === "question" && (
            <QuestionPostForm
              questionText={questionText}
              setQuestionText={setQuestionText}
              tags={questionTags}
              setTags={setQuestionTags}
              isDark={isDark}
            />
          )}

          {activeType === "course" && (
            <CoursePostForm
              courseTitle={courseTitle}
              setCourseTitle={setCourseTitle}
              courseDesc={courseDesc}
              setCourseDesc={setCourseDesc}
              coursePrice={coursePrice}
              setCoursePrice={setCoursePrice}
              courseTags={courseTags}
              setCourseTags={setCourseTags}
              courseMedia={courseMedia}
              onRemoveMedia={(i) =>
                setCourseMedia((prev) => prev.filter((_, j) => j !== i))
              }
              onPickMedia={() => pickMedia("course")}
              isDark={isDark}
            />
          )}

          {/* Privacy */}
          <PrivacySelector
            value={privacy}
            onChange={setPrivacy}
            isDark={isDark}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full py-4 rounded-2xl bg-accent items-center justify-center"
          >
            <Text className="text-white font-semibold text-sm">পোস্ট করুন</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
