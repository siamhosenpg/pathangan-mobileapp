import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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

import {
  useGetUserByUsernameQuery,
  useUpdateUserMutation,
} from "@/redux/api/userApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";

import type { EducationEntry, WorkEntry } from "@/types/userTypes";

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const { data: fullUser, isLoading: userLoading } = useGetUserByUsernameQuery(
    user?.username ?? "",
    {
      skip: !user?.username,
    },
  );

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    aboutText: "",
    gender: "",
    location: "",
  });

  const [works, setWorks] = useState<WorkEntry[]>([]);
  const [educations, setEducations] = useState<EducationEntry[]>([]);

  const [profileImage, setProfileImage] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);

  useEffect(() => {
    if (fullUser) {
      setForm({
        name: fullUser.name || "",
        username: fullUser.username || "",
        bio: fullUser.bio || "",
        aboutText: fullUser.aboutText || "",
        gender: fullUser.gender || "",
        location: fullUser.location || "",
      });

      setWorks(fullUser.work || []);
      setEducations(fullUser.educations || []);
    }
  }, [fullUser]);

  if (!user || userLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator color="#00914d" size="large" />
        <Text className="text-text-secondary mt-3">লোড হচ্ছে...</Text>
      </View>
    );
  }

  const pickImage = async (type: "profile" | "cover") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [16, 9],
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
    try {
      if (!fullUser?.userid) return;

      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, v);
      });

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
        }),
      );

      router.back();
    } catch (err) {
      Alert.alert("Error", "প্রোফাইল আপডেট করা যায়নি");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      {/* COVER */}
      <TouchableOpacity
        onPress={() => pickImage("cover")}
        className="h-48 bg-accent/10 justify-center items-center "
      >
        {coverImage ? (
          <Image source={{ uri: coverImage.uri }} className="w-full h-full" />
        ) : fullUser?.coverImage ? (
          <Image
            source={{ uri: fullUser.coverImage }}
            className="w-full h-full"
          />
        ) : (
          <Text className="text-text-secondary">Cover Change</Text>
        )}
      </TouchableOpacity>

      {/* PROFILE IMAGE */}
      <View className="items-center -mt-12">
        <TouchableOpacity onPress={() => pickImage("profile")}>
          <View className="w-24 h-24 rounded-full border-4 border-background dark:border-dark-background overflow-hidden bg-accent/20">
            {profileImage ? (
              <Image
                source={{ uri: profileImage.uri }}
                className="w-full h-full"
              />
            ) : fullUser?.profileImage ? (
              <Image
                source={{ uri: fullUser.profileImage }}
                className="w-full h-full"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-accent text-xl font-bold">
                  {user.name?.charAt(0)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View className="p-4 gap-4">
        {/* NAME */}
        <TextInput
          value={form.name}
          onChangeText={(t) => handleChange("name", t)}
          placeholder="Name"
          className="bg-white/5 text-text dark:text-dark-text p-3 rounded-xl border border-border  dark:border-dark-border"
        />

        {/* USERNAME */}
        <TextInput
          value={form.username}
          onChangeText={(t) => handleChange("username", t)}
          placeholder="Username"
          className="bg-white/5 text-text dark:text-dark-text p-3 rounded-xl border border-border  dark:border-dark-border"
        />

        {/* BIO */}
        <TextInput
          value={form.bio}
          onChangeText={(t) => handleChange("bio", t)}
          placeholder="Bio"
          multiline
          className="bg-white/5 text-text dark:text-dark-text p-3 rounded-xl border border-border  dark:border-dark-border"
        />

        {/* ABOUT */}
        <TextInput
          value={form.aboutText}
          onChangeText={(t) => handleChange("aboutText", t)}
          placeholder="About"
          multiline
          className="bg-white/5 text-text dark:text-dark-text p-3 rounded-xl border border-border  dark:border-dark-border"
        />

        {/* LOCATION */}
        <TextInput
          value={form.location}
          onChangeText={(t) => handleChange("location", t)}
          placeholder="Location"
          className="bg-white/5 text-text dark:text-dark-text p-3 rounded-xl border border-border  dark:border-dark-border"
        />

        {/* GENDER */}
        <TextInput
          value={form.gender}
          onChangeText={(t) => handleChange("gender", t)}
          placeholder="Gender"
          className="bg-white/5 text-text dark:text-dark-text p-3 rounded-xl border border-border  dark:border-dark-border"
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className="bg-accent p-4 rounded-xl items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
