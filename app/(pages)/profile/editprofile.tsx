import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useGetUserByUsernameQuery,
  useUpdateUserMutation,
} from "@/redux/api/userApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import type { EducationEntry, WorkEntry } from "@/types/userTypes";

const GENDER_OPTIONS = [
  {
    label: "পুরুষ",
    value: "male",
    icon: "man-outline" as const,
  },
  {
    label: "মহিলা",
    value: "female",
    icon: "woman-outline" as const,
  },
  {
    label: "অন্যান্য",
    value: "other",
    icon: "transgender-outline" as const,
  },
];

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View className="mb-4">
    <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs font-medium uppercase tracking-widest mb-2">
      {label}
    </Text>
    {children}
  </View>
);

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAppSelector((state) => state.auth);

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const { data: fullUser, isLoading: userLoading } = useGetUserByUsernameQuery(
    user?.username ?? "",
    { skip: !user?.username, refetchOnMountOrArgChange: true },
  );

  const initialForm = useMemo(
    () => ({
      name: fullUser?.name || "",
      username: fullUser?.username || "",
      bio: fullUser?.bio || "",
      aboutText: fullUser?.aboutText || "",
      gender: fullUser?.gender || "",
      location: fullUser?.location || "",
    }),
    [fullUser],
  );

  const [form, setForm] = useState(initialForm);
  const [works, setWorks] = useState<WorkEntry[]>([]);
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);

  useEffect(() => {
    if (fullUser) {
      setForm(initialForm);
      setWorks(fullUser.work || []);
      setEducations(fullUser.educations || []);
    }
  }, [fullUser]);

  // ✅ dirty check — কোনো পরিবর্তন হয়েছে কিনা
  const isDirty = useMemo(() => {
    if (profileImage || coverImage) return true;
    return (Object.keys(form) as (keyof typeof form)[]).some(
      (key) => form[key] !== initialForm[key],
    );
  }, [form, initialForm, profileImage, coverImage]);

  if (!user || userLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator color="#00914d" size="large" />
        <Text className="text-text-secondary dark:text-dark-text-secondary mt-3 text-sm">
          লোড হচ্ছে...
        </Text>
      </View>
    );
  }

  const pickImage = async (type: "profile" | "cover") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [6, 2],
    });
    if (!result.canceled) {
      if (type === "profile") setProfileImage(result.assets[0]);
      else setCoverImage(result.assets[0]);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!isDirty || isLoading) return;
    try {
      if (!fullUser?.userid) return;
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("work", JSON.stringify(works));
      formData.append("educations", JSON.stringify(educations));
      if (profileImage) {
        formData.append("profileImage", {
          uri: profileImage.uri,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
      }
      if (coverImage) {
        formData.append("coverImage", {
          uri: coverImage.uri,
          name: "cover.jpg",
          type: "image/jpeg",
        } as any);
      }
      const res = await updateUser({
        userid: fullUser.userid,
        formData,
      }).unwrap();
      dispatch(
        setUser({
          id: user.id,
          username: res.user.username,
          name: res.user.name,
          email: res.user.email,
          profileImage: res.user.profileImage,
          badges: res.user.badges,
          greenmarkVerified: res.user.greenmarkVerified,
        }),
      );
      router.back();
    } catch {
      Alert.alert("ত্রুটি", "প্রোফাইল আপডেট করা যায়নি");
    }
  };

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#c4c4c4" : "#3a3a3a"}
          />
        </TouchableOpacity>

        <Text className="text-base font-bold text-text dark:text-dark-text">
          প্রোফাইল সম্পাদন
        </Text>

        {/* ✅ isDirty না হলে button inactive */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isDirty || isLoading}
          className={`px-4 py-1.5 rounded-full ${
            isDirty
              ? "bg-accent"
              : "bg-background-tertiary dark:bg-dark-background-tertiary"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              className={`font-semibold text-sm ${
                isDirty
                  ? "text-white"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              সংরক্ষণ
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Cover */}
        <TouchableOpacity
          onPress={() => pickImage("cover")}
          activeOpacity={0.85}
          className="w-full h-36 bg-accent/10"
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage.uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : fullUser?.coverImage ? (
            <Image
              source={{ uri: fullUser.coverImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-1">
              <Ionicons name="image-outline" size={24} color="#00914d" />
              <Text className="text-accent text-xs font-medium">
                কভার ছবি পরিবর্তন করুন
              </Text>
            </View>
          )}
          <View className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 items-center justify-center">
            <Ionicons name="camera-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Profile image */}
        <View className="items-center -mt-12 mb-4">
          <TouchableOpacity
            onPress={() => pickImage("profile")}
            activeOpacity={0.85}
          >
            <View className="w-24 h-24 rounded-full border-4 border-background dark:border-dark-background overflow-hidden bg-accent/20">
              {profileImage ? (
                <Image
                  source={{ uri: profileImage.uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : fullUser?.profileImage ? (
                <Image
                  source={{ uri: fullUser.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-accent/20">
                  <Text className="text-accent text-2xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent items-center justify-center border-2 border-background dark:border-dark-background">
              <Ionicons name="camera-outline" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mt-2">
            প্রোফাইল ছবি পরিবর্তন করুন
          </Text>
        </View>

        {/* Form */}
        <View className="px-4">
          <Field label="পুরো নাম">
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 h-12 gap-3">
              <Ionicons
                name="person-outline"
                size={16}
                color={isDark ? "#8a8a8a" : "#6d6d6d"}
              />
              <TextInput
                value={form.name}
                onChangeText={(t) => handleChange("name", t)}
                placeholder="আপনার পুরো নাম"
                placeholderTextColor={isDark ? "#3a3a3a" : "#9ca3af"}
                className="flex-1 text-text dark:text-dark-text text-sm"
              />
            </View>
          </Field>

          <Field label="ইউজারনেম">
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 h-12 gap-3">
              <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
                @
              </Text>
              <TextInput
                value={form.username}
                onChangeText={(t) => handleChange("username", t)}
                placeholder="username"
                placeholderTextColor={isDark ? "#3a3a3a" : "#9ca3af"}
                autoCapitalize="none"
                className="flex-1 text-text dark:text-dark-text text-sm"
              />
            </View>
          </Field>

          <Field label="বায়ো">
            <View className="bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 py-3">
              <TextInput
                value={form.bio}
                onChangeText={(t) => handleChange("bio", t)}
                placeholder="সংক্ষিপ্ত পরিচয় লিখুন"
                placeholderTextColor={isDark ? "#3a3a3a" : "#9ca3af"}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                className="text-text dark:text-dark-text text-sm"
              />
            </View>
          </Field>

          <Field label="সম্পর্কে">
            <View className="bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 py-3">
              <TextInput
                value={form.aboutText}
                onChangeText={(t) => handleChange("aboutText", t)}
                placeholder="আপনার সম্পর্কে বিস্তারিত লিখুন"
                placeholderTextColor={isDark ? "#3a3a3a" : "#9ca3af"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="text-text dark:text-dark-text text-sm"
              />
            </View>
          </Field>

          <Field label="অবস্থান">
            <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border rounded-xl px-4 h-12 gap-3">
              <Ionicons
                name="location-outline"
                size={16}
                color={isDark ? "#8a8a8a" : "#6d6d6d"}
              />
              <TextInput
                value={form.location}
                onChangeText={(t) => handleChange("location", t)}
                placeholder="আপনার শহর বা জেলা"
                placeholderTextColor={isDark ? "#3a3a3a" : "#9ca3af"}
                className="flex-1 text-text dark:text-dark-text text-sm"
              />
            </View>
          </Field>

          {/* ✅ Gender — radio style with icon */}
          <Field label="লিঙ্গ">
            <View className="gap-2">
              {GENDER_OPTIONS.map((opt) => {
                const selected = form.gender === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleChange("gender", opt.value)}
                    activeOpacity={0.7}
                    className={`flex-row items-center gap-3 px-4 h-13 py-3.5 rounded-xl border ${
                      selected
                        ? "bg-accent/10 border-accent"
                        : "bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
                    }`}
                  >
                    {/* Icon */}
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        selected
                          ? "bg-accent"
                          : "bg-background-tertiary dark:bg-dark-background-tertiary"
                      }`}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={16}
                        color={
                          selected ? "#fff" : isDark ? "#8a8a8a" : "#6d6d6d"
                        }
                      />
                    </View>

                    {/* Label */}
                    <Text
                      className={`flex-1 text-sm font-semibold ${
                        selected
                          ? "text-accent"
                          : "text-text-secondary dark:text-dark-text-secondary"
                      }`}
                    >
                      {opt.label}
                    </Text>

                    {/* Radio indicator */}
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        selected
                          ? "border-accent"
                          : "border-border dark:border-dark-border"
                      }`}
                    >
                      {selected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>
        </View>
      </ScrollView>
    </View>
  );
}
