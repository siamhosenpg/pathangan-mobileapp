import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface Comment {
  id: string;
  name: string;
  text: string;
  time: string;
  avatar?: string;
}

interface Props {
  comments: Comment[];
  isLoading?: boolean;
}

export default function CommentList({ comments, isLoading }: Props) {
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="small" color="#00914d" />
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 13, color: "#9CA3AF" }}>কোনো মন্তব্য নেই</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {comments.map((comment) => (
        <View
          key={comment.id}
          style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#6B7280" }}>
              {comment.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>

          {/* Bubble */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 16,
                borderTopLeftRadius: 4,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: 2,
                }}
              >
                {comment.name}
              </Text>
              <Text style={{ fontSize: 13, color: "#1F2937", lineHeight: 19 }}>
                {comment.text}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                marginTop: 4,
                paddingLeft: 4,
              }}
            >
              {comment.time}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
