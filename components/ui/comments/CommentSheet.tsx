import {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
} from "@/redux/api/commentsApi";
import type { Comment } from "@/types/commentsTypes";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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

const EmptyComments = () => (
  <View className="flex-1 items-center justify-center gap-2 py-16">
    <Text className="text-3xl">💬</Text>
    <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
      এখনো কোনো মন্তব্য নেই
    </Text>
  </View>
);

const CommentSheet = ({ postId }: Props) => {
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetCommentsByPostQuery({
    postId,
    page,
    limit: 10,
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

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentCard comment={item} onReply={handleReply} />
    ),
    [handleReply],
  );

  const handleEndReached = useCallback(() => {
    if (data?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasMore, isFetching]);

  const renderFooter = useCallback(() => {
    if (!isFetching) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#00914d" />
      </View>
    );
  }, [isFetching]);

  const comments = data?.data ?? [];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border dark:border-dark-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-text dark:text-dark-text">
              মন্তব্য
            </Text>
            {data?.total ? (
              <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                {data.total}টি মন্তব্য
              </Text>
            ) : null}
          </View>
        </View>

        {/* Content */}
        {isLoading && page === 1 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#00914d" />
          </View>
        ) : (
          <FlashList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListEmptyComponent={EmptyComments}
            ListFooterComponent={renderFooter}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 8,
              paddingTop: 4,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input */}
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
