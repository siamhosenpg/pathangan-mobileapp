import {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
} from "@/redux/api/commentsApi";
import type { Comment } from "@/types/commentsTypes";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CommentCard from "./CommentCard";

import CommentFeedInput from "./CommentFeedInput";

interface Props {
  postId: string;
}

const CommentSheet = ({ postId }: Props) => {
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const { data, isLoading } = useGetCommentsByPostQuery({
    postId,
    page: 1,
    limit: 20,
  });

  const [createComment, { isLoading: isSubmitting }] =
    useCreateCommentMutation();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      await createComment({
        postId,
        text: text.trim(),
        ...(replyingTo ? { parentCommentId: replyingTo._id } : {}),
      }).unwrap();
      setText("");
      setReplyingTo(null);
      Keyboard.dismiss();
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  return (
    // ✅ বাইরে tap করলে keyboard dismiss — keyboard problem নেই
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border dark:border-dark-border">
          <Text className="text-base font-bold text-text dark:text-dark-text">
            মন্তব্য
          </Text>
        </View>

        {/* Comments list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#00914d" />
          </View>
        ) : !data?.data?.length ? (
          <View className="flex-1 items-center justify-center gap-2">
            <Text className="text-3xl">💬</Text>
            <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
              এখনো কোনো মন্তব্য নেই
            </Text>
          </View>
        ) : (
          <FlatList
            data={data.data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommentCard comment={item} onReply={handleReply} />
            )}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled" // ✅ list scroll করলেও keyboard থাকে
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input — সবসময় নিচে থাকবে */}
        <CommentFeedInput
          value={text}
          onChangeText={setText}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CommentSheet;
