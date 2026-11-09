import PrivacySelector from "@/components/layout/createpost/PrivacySelector";
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from "@/redux/api/postApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
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

type Privacy = "public" | "private";

const ACCENT = "#00914d";

/* Body auto-grow settings (create page এর মতোই)
 * text-base + leading-6 = 24px
 */
const BODY_LINE_HEIGHT = 24;
const BODY_PADDING_V = 4;
const BODY_MIN_LINES = 1;
const BODY_MAX_LINES = 10;
const BODY_MIN_HEIGHT = BODY_LINE_HEIGHT * BODY_MIN_LINES + BODY_PADDING_V * 2;
const BODY_MAX_HEIGHT = BODY_LINE_HEIGHT * BODY_MAX_LINES + BODY_PADDING_V * 2;

export default function EditPostPage() {
  const { postid } = useLocalSearchParams<{ postid: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";

  // লগইন করা ইউজার
  const { user } = useAppSelector((state) => state.auth);

  const { data: post, isLoading, isError } = useGetPostByIdQuery(postid);

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [error, setError] = useState("");

  // post data লোড হওয়ার পরে form fields fill করা
  useEffect(() => {
    if (post) {
      setTitle(post.content?.title ?? "");
      setText(post.content?.text ?? "");
      // আগের "friends" পোস্ট থাকলে সেটা "public" হিসেবে দেখাবে
      setPrivacy((post as any).privacy === "private" ? "private" : "public");
    }
  }, [post]);

  // ── Security check: logged-in user vs post owner ──
  const postOwnerUsername = (post?.userid as any)?.username;
  const isOwner =
    !!user?.username &&
    !!postOwnerUsername &&
    user.username === postOwnerUsername;

  // শুধু visual এর জন্য
  const hasContent = text.trim().length > 0 || title.trim().length > 0;

  const handleUpdate = async () => {
    if (isUpdating) return;

    if (!text.trim() && !title.trim()) {
      setError("কিছু একটা লিখুন");
      return;
    }
    setError("");

    try {
      await updatePost({
        id: postid,
        body: {
          content: {
            title: title.trim(),
            text: text.trim(),
          },
          privacy,
        },
      }).unwrap();

      router.back();
    } catch (err: any) {
      setError("পোস্ট আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  // ── Error / not found ──
  if (isError || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background gap-y-2">
        <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
        <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
          পোস্ট খুঁজে পাওয়া যায়নি
        </Text>
      </View>
    );
  }

  // ── Security: owner না হলে ব্লক ──
  if (!isOwner) {
    return (
      <View
        className="flex-1 bg-background dark:bg-dark-background"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-3 px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons
              name="close"
              size={20}
              color={isDark ? "#f1f1f1" : "#1b1b1b"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center gap-y-3 px-8">
          <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center">
            <Ionicons name="lock-closed-outline" size={28} color="#f87171" />
          </View>
          <Text className="text-text dark:text-dark-text text-base font-semibold text-center">
            এটা তোমার পোস্ট না
          </Text>
          <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm text-center">
            শুধুমাত্র পোস্টের মালিক এটি সম্পাদনা করতে পারবেন
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            style={{
              backgroundColor: ACCENT,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 999,
              marginTop: 16,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
              ফিরে যান
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Owner হলে edit form দেখাবে ──
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
          accessibilityLabel="বন্ধ করুন"
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>

        <Text className="flex-1 text-lg font-bold text-text dark:text-dark-text">
          পোস্ট সম্পাদনা করুন
        </Text>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={isUpdating}
          activeOpacity={0.85}
          accessibilityRole="button"
          style={{
            backgroundColor: ACCENT,
            opacity: hasContent ? 1 : 0.45,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isUpdating && <ActivityIndicator size="small" color="#fff" />}
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            {isUpdating ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ───────── Divider ───────── */}
      <View className="border-b border-border dark:border-dark-border" />

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
          {error ? (
            <View className="flex-row items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-2xl">
              <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
              <TouchableOpacity onPress={() => setError("")} hitSlop={10}>
                <Ionicons name="close" size={16} color="#f87171" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ───────── Form ───────── */}
          <View className="gap-2">
            {/* Title */}
            <View className="border-b border-border dark:border-dark-border">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="শিরোনাম লিখুন (ঐচ্ছিক)"
                placeholderTextColor={ph}
                className="text-text dark:text-dark-text font-medium py-3"
              />
            </View>

            {/* Body (auto-grow: 1 line theke max 10 line) */}
            <View>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="আপনার মনের কথা লিখুন..."
                placeholderTextColor={ph}
                multiline
                scrollEnabled
                textAlignVertical="top"
                style={{
                  minHeight: BODY_MIN_HEIGHT,
                  maxHeight: BODY_MAX_HEIGHT,
                }}
                className="py-1 leading-6 text-text dark:text-dark-text"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
