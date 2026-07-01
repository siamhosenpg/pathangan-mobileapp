import type { Post } from "@/types/postTypes";
import React from "react";
import { View } from "react-native";

import Postcard from "@/components/ui/card/postcard/Postcard";

interface Props {
  post: Post;
  onCommentPress?: () => void;
}

export default function PostPageLeft({ post }: Props) {
  return (
    <View className="bg-background dark:bg-dark-background overflow-hidden ">
      <Postcard post={post} />
    </View>
  );
}
