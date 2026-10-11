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
import { Video } from "react-native-compressor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { MediaItem } from "./MediaPreviewGrid";
import NormalPostForm, { PostFieldKey } from "./NormalPostForm";
import PostTypeSelector from "./PostTypeSelector";
import PrivacySelector from "./PrivacySelector";
import QuestionPostForm from "./QuestionPostForm";

type PostType = "post" | "question";
type Privacy = "public" | "friends" | "private";
type ErrorKey =
  | "errMixedMedia"
  | "errPickFailed"
  | "errEmptyPost"
  | "errEmptyQuestion"
  | "errMaxMedia";

const ACCENT = "#00914d";
const MAX_MEDIA = 10;

/* কিবোর্ড খোলা অবস্থায় স্ক্রলের জন্য বাড়তি জায়গা */
const KEYBOARD_EXTRA_SPACE = 320;
/* ফোকাস করা ফিল্ড স্ক্রিনের উপর থেকে কতটা নিচে দেখাবে */
const SCROLL_TOP_OFFSET = 90;

const SAFE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/* ─────────── Video compress settings ─────────── */
const MB = 1024 * 1024;
// ৮MB এর ছোট ভিডিও compress করার দরকার নেই
const SKIP_COMPRESS_BELOW = 8 * MB;
// সার্ভার limit (backend এর multer limit এর সাথে মিলিয়ে রাখো)
const MAX_UPLOAD_BYTES = 60 * MB;
// compress করা ভিডিওর সর্বোচ্চ টার্গেট সাইজ (লম্বা ভিডিওর জন্য bitrate কমবে)
const TARGET_MAX_BYTES = 45 * MB;
const TARGET_BITRATE = 2_000_000; // 2 Mbps (30fps আর 60fps দুটোতেই ভালো)
const MIN_BITRATE = 500_000; // এর নিচে কোয়ালিটি খুব খারাপ হয়ে যায়
// longer side সর্বোচ্চ 1280px, মানে 720p (পোর্ট্রেটে 720x1280)
const VIDEO_MAX_SIZE = 1280;

type VideoInfo = { duration?: number; fileSize?: number };

/** uri theke extension ber kori. Unknown/HEIC hole safe default. */
const getExtension = (uri: string, type: "image" | "video") => {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (type === "video") return ext === "mov" ? "mov" : "mp4";
  return ext && SAFE_IMAGE_EXTENSIONS.includes(ext) ? ext : "jpg";
};

/**
 * ভিডিও compress করে। ছোট ভিডিও হলে original ই ফেরত দেয়।
 * temp = true মানে এটা আমাদের বানানো ফাইল, আপলোড শেষে ডিলিট করতে হবে।
 */
const compressVideo = async (
  uri: string,
  info: VideoInfo | undefined,
  onProgress: (p: number) => void,
): Promise<{ uri: string; temp: boolean }> => {
  if (info?.fileSize && info.fileSize < SKIP_COMPRESS_BELOW) {
    return { uri, temp: false };
  }

  // duration অনুযায়ী bitrate ঠিক করি, যাতে ফাইল TARGET_MAX_BYTES এর বেশি না হয়
  const seconds = info?.duration ? info.duration / 1000 : 0;
  let bitrate = TARGET_BITRATE;
  if (seconds > 0) {
    const allowed = (TARGET_MAX_BYTES * 8) / seconds;
    bitrate = Math.max(MIN_BITRATE, Math.min(TARGET_BITRATE, allowed));
  }

  let output: string;
  try {
    output = await Video.compress(
      uri,
      {
        compressionMethod: "manual",
        maxSize: VIDEO_MAX_SIZE,
        bitrate: Math.round(bitrate),
      },
      (p) => onProgress(p),
    );
  } catch (e) {
    console.log("COMPRESS ERROR:", e);
    // compress fail হলে original পাঠাই, তবে সেটা সার্ভার limit এর মধ্যে থাকলে
    if (info?.fileSize && info.fileSize <= MAX_UPLOAD_BYTES) {
      return { uri, temp: false };
    }
    throw e;
  }

  const temp = output !== uri;

  // compress এর পরেও বড় থাকলে আপলোড করে লাভ নেই
  try {
    const size = new File(output).size;
    if (__DEV__) {
      console.log("Compressed size (MB):", (size / MB).toFixed(1));
    }
    if (size > MAX_UPLOAD_BYTES) {
      throw new Error("VIDEO_TOO_LARGE");
    }
  } catch (e: any) {
    if (e?.message === "VIDEO_TOO_LARGE") throw e;
    // size পড়তে না পারলে ignore করি
  }

  return { uri: output, temp };
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
  // ভিডিওর duration/fileSize রাখি (uri দিয়ে), compress এর সময় লাগবে
  const videoInfoRef = useRef<Record<string, VideoInfo>>({});

  /* ─────────── Keyboard scroll ─────────── */
  const scrollRef = useRef<ScrollView>(null);
  // ফর্মের ভেতরের ফিল্ডের y, ফর্ম কন্টেইনারের সাপেক্ষে
  const fieldYRef = useRef<Record<PostFieldKey, number>>({
    title: 0,
    text: 0,
  });
  // ScrollView-এর ভেতরে ফর্ম কন্টেইনারের নিজের y
  const formOffsetYRef = useRef(0);
  const focusedFieldRef = useRef<PostFieldKey | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollToField = useCallback((key: PostFieldKey, delay = 0) => {
    setTimeout(() => {
      const y = formOffsetYRef.current + fieldYRef.current[key];
      scrollRef.current?.scrollTo({
        y: Math.max(y - SCROLL_TOP_OFFSET, 0),
        animated: true,
      });
    }, delay);
  }, []);

  const handleFieldLayout = useCallback((key: PostFieldKey, y: number) => {
    fieldYRef.current[key] = y;
  }, []);

  const handleFieldFocus = useCallback(
    (key: PostFieldKey) => {
      focusedFieldRef.current = key;
      // আগে বাড়তি প্যাডিং বসাই, তারপর স্ক্রল করি
      setIsInputFocused(true);
      scrollToField(key, 150);
      // কিবোর্ড পুরো খোলার পর আরেকবার ঠিক করে নিই
      scrollToField(key, 400);
    },
    [scrollToField],
  );

  const handleFieldBlur = useCallback((key: PostFieldKey) => {
    if (focusedFieldRef.current === key) {
      focusedFieldRef.current = null;
      setIsInputFocused(false);
    }
  }, []);

  const handleTextContentSizeChange = useCallback(() => {
    // লিখতে লিখতে লাইন বাড়লে আবার ঠিক জায়গায় স্ক্রল করি
    if (focusedFieldRef.current === "text") {
      scrollToField("text", 50);
    }
  }, [scrollToField]);

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
    setIsInputFocused(false);
    focusedFieldRef.current = null;
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
      const remaining = MAX_MEDIA - media.length;
      if (remaining <= 0) {
        setErrorKey("errMaxMedia");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.85,
        exif: false,
        // picker নিজে ভিডিও আবার encode করবে না, compress আমরা নিজেরা করব
        videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
        // iPhone er HEIC auto JPG hoye jay
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });
      if (result.canceled) return;

      // ভিডিওর duration আর size মনে রাখি (duration মিলিসেকেন্ডে)
      result.assets.forEach((a) => {
        if (a.type === "video") {
          videoInfoRef.current[a.uri] = {
            duration: a.duration ?? undefined,
            fileSize: a.fileSize ?? undefined,
          };
        }
      });

      const picked: MediaItem[] = result.assets
        .filter((a) => !media.some((m) => m.uri === a.uri)) // duplicate bad
        .map((a) => ({
          uri: a.uri,
          type: a.type === "video" ? "video" : "image",
          fileName: a.fileName ?? undefined,
          mimeType: a.mimeType ?? undefined,
          thumbnail: a.type === "video" ? (a.uri ?? undefined) : undefined,
        }));

      if (picked.length === 0) return;

      // ager media'r sathe notun gulo jog hobe
      const merged = [...media, ...picked];

      const hasVideo = merged.some((m) => m.type === "video");
      const hasImage = merged.some((m) => m.type === "image");
      if (hasVideo && hasImage) {
        setErrorKey("errMixedMedia");
        return;
      }

      setErrorKey("");
      setMedia(merged.slice(0, MAX_MEDIA));
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

    const isPost = payload.type === "post";
    const videoItems = isPost
      ? payload.media.filter((m) => m.type === "video")
      : [];
    const hasVideo = videoItems.length > 0;
    const hasMedia = isPost && payload.media.length > 0;

    // ভিডিও থাকলে প্রথম ৫০% compress এর জন্য, বাকিটা আপলোডের জন্য
    const COMPRESS_SHARE = hasVideo ? 50 : 0;

    let lastReported = 0;
    const report = (value: number) => {
      const next = Math.min(Math.round(value), 99);
      if (next > lastReported) {
        lastReported = next;
        dispatch(setProgress(next));
      }
    };

    // আমাদের বানানো compressed ফাইলের তালিকা, শেষে ডিলিট করব
    const tempUris: string[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    try {
      if (isPost) {
        // ── ধাপ ১: ভিডিও compress (সত্যিকারের progress) ──
        let mediaToUpload = payload.media;

        if (hasVideo) {
          const processed: MediaItem[] = [];
          let videoIndex = 0;

          for (const item of payload.media) {
            if (item.type !== "video") {
              processed.push(item);
              continue;
            }
            const idx = videoIndex++;
            const out = await compressVideo(
              item.uri,
              videoInfoRef.current[item.uri],
              (p) => report(((idx + p) / videoItems.length) * COMPRESS_SHARE),
            );
            if (out.temp) tempUris.push(out.uri);
            processed.push({ ...item, uri: out.uri });
          }
          mediaToUpload = processed;
          report(COMPRESS_SHARE);
        }

        // ── ধাপ ২: আপলোড (progress আনুমানিক) ──
        let fakeProgress = Math.max(lastReported, COMPRESS_SHARE);
        const increment = hasMedia ? 0.8 : 8;
        const cap = hasMedia ? 95 : 85;
        interval = setInterval(() => {
          fakeProgress += increment;
          if (fakeProgress < cap) {
            report(fakeProgress);
          } else if (interval) {
            clearInterval(interval);
          }
        }, 200);

        const formData = new FormData();
        if (payload.title) formData.append("title", payload.title);
        formData.append("text", payload.text);
        formData.append("privacy", payload.privacy);
        buildFormData(mediaToUpload, formData);
        await createPost(formData).unwrap();
      } else {
        let fakeProgress = 0;
        interval = setInterval(() => {
          fakeProgress += 8;
          if (fakeProgress < 85) {
            report(fakeProgress);
          } else if (interval) {
            clearInterval(interval);
          }
        }, 200);

        await createQuestion({
          questionText: payload.questionText,
          tags: payload.tags,
          privacy: payload.privacy,
        }).unwrap();
      }

      if (interval) clearInterval(interval);
      dispatch(setProgress(100));
      dispatch(finishUpload());
    } catch (err: any) {
      if (interval) clearInterval(interval);
      console.log("UPLOAD ERROR:", JSON.stringify(err, null, 2), err?.message);
      dispatch(failUpload());
    } finally {
      // compress করা ফাইল ক্যাশ থেকে মুছে ফেলি (সফল বা ব্যর্থ, দুই ক্ষেত্রেই)
      for (const u of tempUris) {
        try {
          const f = new File(u);
          if (f.exists) f.delete();
        } catch {
          // ডিলিট ব্যর্থ হলে ignore
        }
      }
      submitLockRef.current = false;
    }
  };

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-background"
      style={{ paddingTop: insets.top }}
    >
      {/* ───────── Header ───────── */}
      <View className="flex-row items-center gap-3 px-4 py-3">
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

      {/* ───────── Type selector (full width) ───────── */}
      <PostTypeSelector
        active={activeType}
        types={["post", "question"]}
        onChange={(next) => {
          setActiveType(next as PostType);
          setErrorKey("");
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            gap: 16,
            // কিবোর্ড খোলা থাকলে নিচে বাড়তি জায়গা, যাতে স্ক্রল করা যায়
            paddingBottom:
              insets.bottom + 40 + (isInputFocused ? KEYBOARD_EXTRA_SPACE : 0),
          }}
        >
          {/* ───────── User row + Privacy select ───────── */}
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

            <View className="flex-1 gap-1">
              <Text
                className="text-text dark:text-dark-text text-[15px] font-semibold"
                numberOfLines={1}
              >
                {user?.name}
              </Text>
              <PrivacySelector
                value={privacy}
                onChange={setPrivacy}
                isDark={isDark}
              />
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
            <View
              onLayout={(e) => {
                formOffsetYRef.current = e.nativeEvent.layout.y;
              }}
            >
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
                onFieldFocus={handleFieldFocus}
                onFieldBlur={handleFieldBlur}
                onFieldLayout={handleFieldLayout}
                onTextContentSizeChange={handleTextContentSizeChange}
              />
            </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
