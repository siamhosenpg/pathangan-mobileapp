import {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
} from "@/redux/api/commentsApi";
import type { Comment } from "@/types/commentsTypes";
import { getErrorMessage } from "@/utils/getErrorMessage"; // path ঠিক করে নিও
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CommentCard from "./CommentCard";
import CommentFeedInput from "./CommentFeedInput";

interface Props {
  postId: string;
}

// ===================== SKELETON =====================
// halka pulse animation. Tomar nijer comment skeleton thakle
// CommentSkeletonItem er jaigay seta boshate paro.
const Pulse = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

const CommentSkeletonItem = () => (
  <Pulse>
    <View className="flex-row gap-3 px-1 py-3">
      <View className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
      <View className="flex-1 gap-2">
        <View className="h-3 w-1/3 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
        <View className="h-3 w-4/5 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
        <View className="h-3 w-3/5 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
      </View>
    </View>
  </Pulse>
);

const CommentSkeletonList = () => (
  <View className="px-3 pt-2">
    <CommentSkeletonItem />
    <CommentSkeletonItem />
    <CommentSkeletonItem />
    <CommentSkeletonItem />
  </View>
);

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

  const { data, error, isLoading, isFetching, isError, refetch } =
    useGetCommentsByPostQuery({
      postId,
      page,
      limit: 10,
    });

  const [createComment, { isLoading: isSubmitting }] =
    useCreateCommentMutation();

  const comments = data?.data ?? [];

  // শুধু তখনই full error, যখন দেখানোর মতো একটা মন্তব্যও নেই
  const showFullError = !isLoading && isError && comments.length === 0;

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
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
      // text ar replyingTo thakbe, user abar chesta korte pare
      Alert.alert("মন্তব্য পাঠানো যায়নি", getErrorMessage(err));
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
    // error thakle nije nije abar chalabo na,
    // user "আবার চেষ্টা করো" chaple tokhon chalbe
    if (isError) return;
    if (data?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [isError, data?.hasMore, isFetching]);

  const renderFooter = useCallback(() => {
    // 1) notun mantobbo ashchhe -> skeleton
    if (isFetching && comments.length > 0) {
      return <CommentSkeletonItem />;
    }

    // 2) load more fail -> purono mantobbo thakbe, niche shudhu chhoto retry
    // (page already barano hoyeche, tai refetch sei fail hoya page-i abar anbe)
    if (isError && comments.length > 0) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            আরও মন্তব্য লোড করা যায়নি
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              আবার চেষ্টা করো
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [isFetching, isError, comments.length, refetch]);

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
        {isLoading ? (
          <CommentSkeletonList />
        ) : showFullError ? (
          <View className="items-center justify-center py-16 px-8 gap-3">
            <Text className="text-4xl">📡</Text>
            <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
              {getErrorMessage(error)}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              activeOpacity={0.8}
              className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
            >
              <Text className="text-sm font-semibold text-text dark:text-dark-text">
                আবার চেষ্টা করো
              </Text>
            </TouchableOpacity>
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
