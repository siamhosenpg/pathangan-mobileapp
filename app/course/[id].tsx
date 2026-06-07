import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetPostByIdQuery } from "@/redux/api/postApi";

import BookmarkButton from "@/components/ui/buttons/BookmarkButton";
import LikeButton from "@/components/ui/buttons/LikeButton";
import PostProfiletop from "@/components/ui/card/postcard/PostProfileTop";

const screenWidth = Dimensions.get("window").width;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: post, isLoading, isError } = useGetPostByIdQuery(id as string);

  const [activeSlide, setActiveSlide] = useState(0);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-red-500 text-sm">
          কোর্স লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  const course = post.course;
  const media = course?.media ?? [];
  const hasMultiple = media.length > 1;

  const prevSlide = () =>
    setActiveSlide((p) => (p === 0 ? media.length - 1 : p - 1));

  const nextSlide = () =>
    setActiveSlide((p) => (p === media.length - 1 ? 0 : p + 1));

  const current = media[activeSlide];

  return (
    <ScrollView className="flex-1 bg-background">
      {/* ===== MEDIA SLIDER ===== */}
      {media.length > 0 && (
        <View
          style={{
            width: screenWidth,
            height: screenWidth * 0.56,
            backgroundColor: "#000",
          }}
        >
          {current.type === "video" ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="play-circle" size={60} color="white" />
            </View>
          ) : (
            <Image
              source={{ uri: current.url }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}

          {/* controls */}
          {hasMultiple && (
            <>
              <TouchableOpacity
                onPress={prevSlide}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "45%",
                  padding: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={nextSlide}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "45%",
                  padding: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>

              {/* dots */}
              <View
                style={{
                  position: "absolute",
                  bottom: 10,
                  flexDirection: "row",
                  alignSelf: "center",
                }}
              >
                {media.map((_: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setActiveSlide(i)}
                    style={{
                      width: i === activeSlide ? 18 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        i === activeSlide ? "#fff" : "rgba(255,255,255,0.5)",
                      marginHorizontal: 3,
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* ===== CONTENT ===== */}
      <View className="p-4">
        <PostProfiletop
          postId={post._id}
          user={post.userid}
          createdAt={post.createdAt}
        />

        {course?.title && (
          <Text className="text-xl font-bold mt-2 text-text">
            {course.title}
          </Text>
        )}

        {course?.description && (
          <Text className="text-sm text-text-secondary mt-2 leading-5">
            {course.description}
          </Text>
        )}

        {/* tags */}
        {(course?.tags?.length ?? 0) > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {(course?.tags ?? []).map((tag: string, i: number) => (
              <Text
                key={i}
                className="text-xs px-3 py-1 rounded-full bg-background-secondary text-text-secondary"
              >
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* price + actions */}
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-border">
          <View>
            {(course?.price ?? 0) > 0 ? (
              <Text className="text-lg font-bold text-accent">
                ৳ {course?.price}
              </Text>
            ) : (
              <Text className="text-green-600 font-semibold">বিনামূল্যে</Text>
            )}
          </View>

          <View className="flex-row items-center gap-4">
            <LikeButton postId={post._id} initialLiked={post.isReacted} />
            <BookmarkButton postId={post._id} />
          </View>
        </View>

        {/* comments */}
        <View className="mt-5">
          <Text className="text-base font-bold mb-2 text-text">Comments</Text>

          <View className="h-80 bg-background-secondary rounded-xl p-3">
            {/* এখানে তুমি CommentsSection লাগাতে পারো */}
            <Text className="text-text-secondary">
              Comments UI এখানে add করো
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
