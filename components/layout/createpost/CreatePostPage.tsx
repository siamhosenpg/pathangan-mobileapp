import {
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
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
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
import { MediaItem } from "./MediaPreviewGrid";
import NormalPostForm from "./NormalPostForm";
import PostTypeSelector from "./PostTypeSelector";
import PrivacySelector from "./PrivacySelector";
import QuestionPostForm from "./QuestionPostForm";

type PostType = "post" | "question";
type Privacy = "public" | "friends" | "private";
type ErrorKey =
  | "errMixedMedia"
  | "errPickFailed"
  | "errEmptyPost"
  | "errEmptyQuestion";

const ACCENT = "#00914d";

const SAFE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/** uri theke extension ber kori. Unknown/HEIC hole safe default. */
const getExtension = (uri: string, type: "image" | "video") => {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (type === "video") return ext === "mov" ? "mov" : "mp4";
  return ext && SAFE_IMAGE_EXTENSIONS.includes(ext) ? ext : "jpg";
};

export default function CreatePostPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useDispatch();

  const [activeType, setActiveType] = useState<PostType>("post");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  // error er key rakhi, render e translate kori (language bodlale o thik thake)
  const [errorKey, setErrorKey] = useState<ErrorKey | "">("");

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [questionText, setQuestionText] = useState("");
  const [questionTags, setQuestionTags] = useState("");

  // Reset e barbe. Form er `key` hisebe use hoy, tai form remount hoye
  // vitorer local state / uncontrolled input o clear hoy.
  const [formKey, setFormKey] = useState(0);

  const [createPost] = useCreatePostMutation();
  const [createQuestion] = useCreateQuestionPostMutation();

  // Submit er somoy back popup skip korar jonno
  const allowLeaveRef = useRef(false);
  // Double tap atkanor jonno (state na, tai kokhono atke thake na)
  const submitLockRef = useRef(false);

  const hasUnsavedChanges =
    title.trim().length > 0 ||
    text.trim().length > 0 ||
    media.length > 0 ||
    questionText.trim().length > 0 ||
    questionTags.trim().length > 0;

  // Shudhu visual er jonno. Button disable korar jonno na.
  const hasContent =
    activeType === "post"
      ? text.trim().length > 0 || media.length > 0
      : questionText.trim().length > 0;

  /* ─────────── Form reset ─────────── */
  const resetForm = useCallback(() => {
    setTitle("");
    setText("");
    setMedia([]);
    setQuestionText("");
    setQuestionTags("");
    setActiveType("post");
    setPrivacy("public");
    setErrorKey("");
    setFormKey((k) => k + 1); // form remount, input clear
  }, []);

  /* ─────────── Screen focus hole flag reset ─────────── */
  useFocusEffect(
    useCallback(() => {
      allowLeaveRef.current = false;
      submitLockRef.current = false;
    }, []),
  );

  /* ─────────── Back confirmation ─────────── */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current || !hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(t("postData.discardTitle"), t("postData.discardMessage"), [
        { text: t("postData.stay"), style: "cancel" },
        {
          text: t("postData.discard"),
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, t]);

  /* ─────────── Media ─────────── */
  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 0.85,
        exif: false,
        // iPhone er HEIC auto JPG hoye jay
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });
      if (result.canceled) return;

      const selected: MediaItem[] = result.assets.map((a) => ({
        uri: a.uri,
        type: a.type === "video" ? "video" : "image",
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
        thumbnail: a.type === "video" ? (a.uri ?? undefined) : undefined,
      }));

      const hasVideo = selected.some((m) => m.type === "video");
      const hasImage = selected.some((m) => m.type === "image");
      if (hasVideo && hasImage) {
        setErrorKey("errMixedMedia");
        return;
      }

      setErrorKey("");
      setMedia(selected);
    } catch {
      setErrorKey("errPickFailed");
    }
  };

  const buildFormData = (items: MediaItem[], formData: FormData) => {
    items.forEach((m, i) => {
      const ext = getExtension(m.uri, m.type === "video" ? "video" : "image");
      // Original name (IMG_1234.HEIC) na diye safe name
      const fileName = `upload-${Date.now()}-${i}.${ext}`;
      const file = new File(m.uri);
      formData.append("media", file, fileName);
    });
  };

  /* ─────────── Submit ─────────── */
  const handleSubmit = async () => {
    if (submitLockRef.current) return;
    setErrorKey("");

    if (activeType === "post" && !text.trim() && media.length === 0) {
      setErrorKey("errEmptyPost");
      return;
    }
    if (activeType === "question" && !questionText.trim()) {
      setErrorKey("errEmptyQuestion");
      return;
    }

    submitLockRef.current = true;

    // 1) Form er value gulo copy kore rakhi (reset er por lagbe)
    const payload = {
      type: activeType,
      title: title.trim(),
      text,
      media,
      questionText: questionText.trim(),
      tags: questionTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      privacy,
    };

    // 2) Form puro clear (state + form remount)
    resetForm();

    // 3) Popup na dekhiye feed e jao
    allowLeaveRef.current = true;
    router.replace("/(tabs)/feed" as any);

    // Screen mounted thakle porer bar back popup abar kaj korar jonno
    setTimeout(() => {
      allowLeaveRef.current = false;
    }, 600);

    // 4) Background upload (payload theke, state theke na)
    dispatch(startUpload());

    const hasMedia = payload.type === "post" && payload.media.length > 0;
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
      if (payload.type === "post") {
        const formData = new FormData();
        if (payload.title) formData.append("title", payload.title);
        formData.append("text", payload.text);
        formData.append("privacy", payload.privacy);
        buildFormData(payload.media, formData);
        await createPost(formData).unwrap();
      } else {
        await createQuestion({
          questionText: payload.questionText,
          tags: payload.tags,
          privacy: payload.privacy,
        }).unwrap();
      }

      clearInterval(interval);
      dispatch(setProgress(100));
      dispatch(finishUpload());
    } catch (err: any) {
      clearInterval(interval);
      console.log("UPLOAD ERROR:", JSON.stringify(err, null, 2));
      dispatch(failUpload());
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-background"
      style={{ paddingTop: insets.top }}
    >
      {/* ───────── Header ───────── */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border/60 dark:border-dark-border/60">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("postData.close")}
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>

        <Text className="flex-1 text-lg font-bold text-text dark:text-dark-text">
          {activeType === "post"
            ? t("postData.newPost")
            : t("postData.newQuestion")}
        </Text>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          accessibilityRole="button"
          style={{
            backgroundColor: ACCENT,
            opacity: hasContent ? 1 : 0.45,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            {activeType === "post"
              ? t("postData.submitPost")
              : t("postData.submitQuestion")}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            gap: 16,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {/* ───────── Type selector (segmented) ───────── */}
          <PostTypeSelector
            active={activeType}
            types={["post", "question"]}
            onChange={(next) => {
              setActiveType(next as PostType);
              setErrorKey("");
            }}
            isDark={isDark}
          />

          {/* ───────── User row ───────── */}
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full overflow-hidden bg-accent/20 items-center justify-center border border-border dark:border-dark-border">
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-accent font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-text dark:text-dark-text text-[15px] font-semibold"
                numberOfLines={1}
              >
                {user?.name}
              </Text>
              <Text
                className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-0.5"
                numberOfLines={1}
              >
                @{user?.username}
              </Text>
            </View>
          </View>

          {/* ───────── Error ───────── */}
          {errorKey ? (
            <View className="flex-row items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-2xl">
              <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">
                {t(`postData.${errorKey}`)}
              </Text>
              <TouchableOpacity onPress={() => setErrorKey("")} hitSlop={10}>
                <Ionicons name="close" size={16} color="#f87171" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ───────── Forms (key bodlale remount hoy) ───────── */}
          {activeType === "post" ? (
            <NormalPostForm
              key={`post-${formKey}`}
              title={title}
              setTitle={setTitle}
              text={text}
              setText={setText}
              media={media}
              onRemoveMedia={(i) =>
                setMedia((prev) => prev.filter((_, j) => j !== i))
              }
              onPickMedia={pickMedia}
              isDark={isDark}
            />
          ) : (
            <QuestionPostForm
              key={`question-${formKey}`}
              questionText={questionText}
              setQuestionText={setQuestionText}
              tags={questionTags}
              setTags={setQuestionTags}
              isDark={isDark}
            />
          )}

          {/* ───────── Privacy ───────── */}
          <PrivacySelector
            value={privacy}
            onChange={setPrivacy}
            isDark={isDark}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
