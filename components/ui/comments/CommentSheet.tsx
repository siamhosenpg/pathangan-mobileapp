import { useSheetCloseGuard } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
  useUpdateCommentMutation,
} from "@/redux/api/commentsApi";
import type { Comment } from "@/types/commentsTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommentCard, { type ExpandRequest } from "./CommentCard";
import CommentFeedInput from "./CommentFeedInput";

interface Props {
  postId: string;
}

const ACCENT = "#00914d";
const PAGE_SIZE = 10;

// English digits -> Bengali digits
const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

// ===================== SKELETON =====================
const Pulse = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

const Bone = ({ className }: { className: string }) => (
  <View
    className={`bg-background-secondary dark:bg-dark-background-secondary ${className}`}
  />
);

const CommentSkeletonItem = () => (
  <Pulse>
    <View className="flex-row gap-3 px-1 py-3">
      <Bone className="w-9 h-9 rounded-full" />
      <View className="flex-1 gap-2">
        <Bone className="h-3 w-1/3 rounded-full" />
        <Bone className="h-3 w-full rounded-full" />
        <Bone className="h-3 w-3/5 rounded-full" />
        <View className="flex-row gap-4 mt-1">
          <Bone className="h-2.5 w-10 rounded-full" />
          <Bone className="h-2.5 w-12 rounded-full" />
        </View>
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

// ===================== SMALL PIECES =====================
const IconBubble = ({
  name,
  size = 30,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
}) => (
  <View className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center">
    <Ionicons name={name} size={size} color={ACCENT} />
  </View>
);

const RetryButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="flex-row items-center gap-2 px-5 py-2.5 rounded-full bg-accent"
  >
    <Ionicons name="refresh" size={15} color="#fff" />
    <Text className="text-sm font-semibold text-white">আবার চেষ্টা করো</Text>
  </TouchableOpacity>
);

const EmptyComments = () => (
  <View className="flex-1 items-center justify-center gap-3 py-16 px-8">
    <IconBubble name="chatbubble-ellipses-outline" />
    <View className="items-center gap-1">
      <Text className="text-base font-semibold text-text dark:text-dark-text">
        এখনো কোনো মন্তব্য নেই
      </Text>
      <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
        প্রথম মন্তব্যটি আপনিই করুন
      </Text>
    </View>
  </View>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <View className="items-center justify-center py-16 px-8 gap-4">
    <IconBubble name="cloud-offline-outline" />
    <View className="items-center gap-1">
      <Text className="text-base font-semibold text-text dark:text-dark-text">
        কিছু একটা সমস্যা হয়েছে
      </Text>
      <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
        {message}
      </Text>
    </View>
    <RetryButton onPress={onRetry} />
  </View>
);

// ===================== MAIN =====================
const CommentSheet = ({ postId }: Props) => {
  const { t } = useTranslation();

  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [page, setPage] = useState(1);
  // reply দেওয়ার পর কোন thread খুলতে হবে
  const [expandRequest, setExpandRequest] = useState<ExpandRequest | null>(
    null,
  );

  const { data, error, isLoading, isFetching, isError, refetch } =
    useGetCommentsByPostQuery({
      postId,
      page,
      limit: PAGE_SIZE,
    });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const isSubmitting = isCreating || isUpdating;

  const comments = data?.data ?? [];
  const showFullError = !isLoading && isError && comments.length === 0;

  // ===================== DRAFT TRACKING =====================
  // নতুন comment/reply: কিছু লেখা থাকলে draft
  // edit: আগের text থেকে বদলালে draft
  const hasDraft = editingComment
    ? text.trim() !== editingComment.text.trim()
    : text.trim().length > 0;

  // callback গুলো যেন stable থাকে, তাই ref এ রাখছি
  const hasDraftRef = useRef(false);
  const editingRef = useRef<Comment | null>(null);
  hasDraftRef.current = hasDraft;
  editingRef.current = editingComment;

  // sheet বন্ধ করতে গেলে (backdrop / drag / back button) লেখা থাকলে confirm
  useSheetCloseGuard({
    when: hasDraft,
    title: editingComment
      ? t("commentData.discardEditTitle")
      : t("commentData.discardTitle"),
    message: editingComment
      ? t("commentData.discardEditMessage")
      : t("commentData.discardMessage"),
    confirmText: t("commentData.discard"),
    cancelText: t("commentData.keepWriting"),
  });

  // বর্তমান লেখা/edit নষ্ট হবে এমন কাজের আগে confirm
  const withDraftCheck = useCallback(
    (proceed: () => void) => {
      if (!hasDraftRef.current) {
        proceed();
        return;
      }
      Alert.alert(
        t("commentData.replaceDraftTitle"),
        t("commentData.replaceDraftMessage"),
        [
          { text: t("commentData.keepWriting"), style: "cancel" },
          {
            text: t("commentData.discard"),
            style: "destructive",
            onPress: proceed,
          },
        ],
      );
    },
    [t],
  );

  // ===================== SUBMIT =====================
  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    // ---- edit mode ----
    if (editingComment) {
      // কিছু বদলায়নি হলে শুধু edit mode থেকে বের হবো
      if (trimmed === editingComment.text.trim()) {
        setEditingComment(null);
        setText("");
        Keyboard.dismiss();
        return;
      }

      try {
        await updateComment({
          commentId: editingComment._id,
          text: trimmed,
          postId,
          parentCommentId: editingComment.parentCommentId,
        }).unwrap();

        setEditingComment(null);
        setText("");
        Keyboard.dismiss();
      } catch (err) {
        // text আর edit mode থাকবে, যাতে আবার চেষ্টা করা যায়
        Alert.alert(t("commentData.updateFailed"), getErrorMessage(err));
      }
      return;
    }

    // ---- নতুন comment / reply ----
    try {
      const result = await createComment({
        postId,
        text: trimmed,
        ...(replyingTo ? { parentCommentId: replyingTo._id } : {}),
      }).unwrap();

      // reply হলে ওই thread খুলে দেওয়া
      if (replyingTo) {
        setExpandRequest({
          rootId: result.data.parentCommentId ?? replyingTo._id,
          nonce: Date.now(),
        });
      }

      setText("");
      setReplyingTo(null);
      Keyboard.dismiss();
    } catch (err) {
      Alert.alert("মন্তব্য পাঠানো যায়নি", getErrorMessage(err));
    }
  };

  // ===================== REPLY / EDIT HANDLERS =====================
  const handleReply = useCallback(
    (comment: Comment) => {
      // edit চলার সময় reply চাপলে edit বাদ দিয়ে reply mode এ যাবে
      if (editingRef.current) {
        withDraftCheck(() => {
          setEditingComment(null);
          setText("");
          setReplyingTo(comment);
        });
        return;
      }
      setReplyingTo(comment);
    },
    [withDraftCheck],
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleEdit = useCallback(
    (comment: Comment) => {
      withDraftCheck(() => {
        setReplyingTo(null);
        setEditingComment(comment);
        setText(comment.text);
      });
    },
    [withDraftCheck],
  );

  const handleCancelEdit = useCallback(() => {
    withDraftCheck(() => {
      setEditingComment(null);
      setText("");
      Keyboard.dismiss();
    });
  }, [withDraftCheck]);

  // ===================== LIST =====================
  const renderItem = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentCard
        comment={item}
        onReply={handleReply}
        onEdit={handleEdit}
        expandRequest={expandRequest}
      />
    ),
    [handleReply, handleEdit, expandRequest],
  );

  const handleEndReached = useCallback(() => {
    if (isError) return;
    if (data?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [isError, data?.hasMore, isFetching]);

  const renderFooter = useCallback(() => {
    if (isFetching && comments.length > 0) {
      return <CommentSkeletonItem />;
    }

    if (isError && comments.length > 0) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            আরও মন্তব্য লোড করা যায়নি
          </Text>
          <RetryButton onPress={() => refetch()} />
        </View>
      );
    }

    if (!data?.hasMore && comments.length >= PAGE_SIZE) {
      return (
        <View className="py-6 items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-border dark:bg-dark-border" />
        </View>
      );
    }

    return null;
  }, [isFetching, isError, comments.length, data?.hasMore, refetch]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {/* Header */}
      <View className="px-4 py-3.5 border-b border-border dark:border-dark-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-text dark:text-dark-text">
              {t("comments")}
            </Text>
            {data?.total ? (
              <View className="px-2 py-0.5 rounded-full bg-accent/10">
                <Text className="text-xs font-semibold text-accent">
                  {toBn(data.total)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <CommentSkeletonList />
      ) : showFullError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <FlashList
          data={comments}
          extraData={expandRequest}
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
          keyboardDismissMode="on-drag"
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
        editingComment={editingComment}
        onCancelEdit={handleCancelEdit}
      />
    </View>
  );
};

export default CommentSheet;
