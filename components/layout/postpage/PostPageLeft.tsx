import Postcard from "@/components/ui/card/postcard/Postcard";
import type { Post } from "@/types/postTypes";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

interface Props {
  post: Post;
  onCommentPress?: () => void;
}

export default function PostPageLeft({ post }: Props) {
  // screen focus থাকলেই ভিডিও চলবে।
  // অন্য screen-এ গেলে বা back করলে false হবে, তখন ভিডিও থামবে ও unload হবে
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  return (
    <View className="bg-background dark:bg-dark-background overflow-hidden">
      <Postcard
        post={post}
        isVideoVisible={isFocused}
        isVideoNearVisible={isFocused}
      />
    </View>
  );
}
