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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">(
    "public",
  );
  const [error, setError] = useState("");

  // post data লোড হওয়ার পরে form fields fill করা
  useEffect(() => {
    if (post) {
      setTitle(post.content?.title ?? "");
      setText(post.content?.text ?? "");
      setPrivacy((post as any).privacy ?? "public");
    }
  }, [post]);

  // ── Security check: logged-in user vs post owner ──
  const postOwnerUsername = (post?.userid as any)?.username;
  const isOwner =
    !!user?.username &&
    !!postOwnerUsername &&
    user.username === postOwnerUsername;

  const handleUpdate = async () => {
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
        <ActivityIndicator size="large" color="#00914d" />
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
      <View className="flex-1 bg-background dark:bg-dark-background">
        <View
          style={{ paddingTop: insets.top + 12 }}
          className="px-4 flex-row items-center gap-3"
        >
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
            className="mt-4 px-6 py-3 rounded-2xl bg-accent"
          >
            <Text className="text-white font-semibold text-sm">ফিরে যান</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Owner হলে edit form দেখাবে ──
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
              পোস্ট সম্পাদনা করুন
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View className="flex-row items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-2xl">
              <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Title */}
          <View className="border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="শিরোনাম লিখুন (ঐচ্ছিক)"
              placeholderTextColor={ph}
              className="text-text dark:text-dark-text text-sm font-medium py-3.5"
            />
          </View>

          {/* Body */}
          <View className="border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="আপনার মনের কথা লিখুন..."
              placeholderTextColor={ph}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="text-text dark:text-dark-text text-sm"
              style={{ minHeight: 110 }}
            />
          </View>

          {/* Privacy */}
          <View className="gap-2">
            <Text className="text-text dark:text-dark-text text-sm font-semibold">
              কে দেখতে পাবে?
            </Text>
            <View className="flex-row gap-2">
              {(
                [
                  { value: "public", label: "সবাই", icon: "earth-outline" },
                  {
                    value: "friends",
                    label: "বন্ধুরা",
                    icon: "people-outline",
                  },
                  {
                    value: "private",
                    label: "শুধু আমি",
                    icon: "lock-closed-outline",
                  },
                ] as const
              ).map((opt) => {
                const active = privacy === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setPrivacy(opt.value)}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                      active
                        ? "bg-accent border-accent"
                        : "border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
                    }`}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={14}
                      color={active ? "#fff" : isDark ? "#8a8a8a" : "#666"}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        active
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

          {/* Submit */}
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={isUpdating}
            className="w-full py-4 rounded-2xl bg-accent items-center justify-center flex-row gap-2"
          >
            {isUpdating && <ActivityIndicator size="small" color="#fff" />}
            <Text className="text-white font-semibold text-sm">
              {isUpdating ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
