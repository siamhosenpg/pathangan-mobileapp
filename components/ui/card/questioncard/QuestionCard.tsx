import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import PostCountLeft from "../postcard/PostCountLeft";
import PostProfileTop from "../postcard/PostProfileTop";

import { useGetAnswersByQuestionQuery } from "@/redux/api/answer/answersApi";
import type { Answer } from "@/types/answerTypes";
import type { Post } from "@/types/postTypes";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";
import AnswerButton from "../../buttons/AnswerButton";
import BookmarkButton from "../../buttons/BookmarkButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";
import AnswerCard from "./AnswerCard";
import AnswerPopupContent from "./AnswerPopupContent";

const LOAD_MORE_LIMIT = 8;

interface Props {
  post: Post;
}

const QuestionCard = ({ post }: Props) => {
  const { userid, question, createdAt, _id, previewAnswers, answersCount } =
    post;

  const { open } = useBottomSheet();

  // "আরো উত্তর দেখুন" click করলে এই state true হবে
  const [showMore, setShowMore] = useState(false);
  // cursor-based pagination এর জন্য cursor stack
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  // feed থেকে আসা preview answers + manually loaded সব answers মিলিয়ে রাখা
  const [loadedAnswers, setLoadedAnswers] = useState<Answer[]>([]);

  const { data, isFetching } = useGetAnswersByQuestionQuery(
    { questionId: _id, limit: LOAD_MORE_LIMIT, cursor },
    // শুধু "আরো উত্তর দেখুন" click করার পরেই fetch শুরু হবে
    { skip: !showMore },
  );

  // নতুন data আসলে loadedAnswers এ append করা
  // RTK Query caching নিজেই handle করে, তাই এখানে useEffect লাগবে না —
  // data পরিবর্তনের সাথে সাথে component re-render হবে
  const allLoadedAnswers = (() => {
    if (!data) return loadedAnswers;
    // previewAnswers এর id গুলোও বাদ দিতে হবে
    const existingIds = new Set([
      ...(previewAnswers ?? []).map((a) => a._id),
      ...loadedAnswers.map((a) => a._id),
    ]);
    const newOnes = data.answers.filter((a) => !existingIds.has(a._id));
    return [...loadedAnswers, ...newOnes];
  })();

  const handleLoadMore = () => {
    if (!showMore) {
      // প্রথমবার click — fetch শুরু করা
      setShowMore(true);
      return;
    }
    if (data?.nextCursor) {
      // পরবর্তী page এর জন্য cursor set করা
      setLoadedAnswers(allLoadedAnswers);
      setCursor(data.nextCursor);
    }
  };

  const handleAnswerOpen = () => {
    open(
      <AnswerPopupContent
        questionId={_id}
        questionText={question?.questionText ?? ""}
      />,
    );
  };

  // feed থেকে আসা ২টা preview + manually loaded answers মিলিয়ে কতটা দেখানো হচ্ছে
  const previewCount = previewAnswers?.length ?? 0;
  const totalShown = previewCount + allLoadedAnswers.length;
  const totalAnswers = answersCount ?? 0;
  const hasMoreToLoad = totalShown < totalAnswers;

  return (
    <View className="bg-background dark:bg-dark-background pt-4 border-b border-border dark:border-dark-border">
      <PostProfileTop user={userid} createdAt={createdAt} postId={_id} />

      <Text className="mt-2 px-4 text-text dark:text-dark-text font-semibold text-base leading-6">
        {question?.questionText}
      </Text>

      {/* feed থেকে আসা preview answers (সবসময় দেখা যাবে) */}
      {previewAnswers && previewAnswers.length > 0 && (
        <View className="px-4 mt-2 gap-2">
          {previewAnswers.map((answer, index) => (
            <View
              key={answer._id}
              className={
                index !== previewAnswers.length - 1
                  ? "border-b border-border/50 dark:border-dark-border/50"
                  : ""
              }
            >
              <AnswerCard answer={answer} questionId={_id} />
            </View>
          ))}
        </View>
      )}

      {/* manually loaded answers ("আরো উত্তর দেখুন" click করার পরে আসা) */}
      {allLoadedAnswers.length > 0 && (
        <View className="px-4 mt-1 gap-2">
          {allLoadedAnswers.map((answer, index) => (
            <View
              key={answer._id}
              className={
                index !== allLoadedAnswers.length - 1
                  ? "border-b border-border/50 dark:border-dark-border/50"
                  : ""
              }
            >
              <AnswerCard answer={answer} questionId={_id} />
            </View>
          ))}
        </View>
      )}

      {/* counts */}
      <View className="px-4 py-2 mt-2 w-full border-b border-border/50 dark:border-dark-border/50 flex-row items-center justify-between">
        <PostCountLeft
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          sharesCount={post.sharesCount}
          viewsCount={post.viewsCount}
          classStyle={"w-fit"}
        />

        {/* loading spinner */}
        {isFetching && <ActivityIndicator size="small" color="#00914d" />}

        {/* আরো উত্তর আছে এবং এখন fetch হচ্ছে না — button দেখাবে */}
        {!isFetching && hasMoreToLoad && (
          <TouchableOpacity onPress={handleLoadMore}>
            <Text className="text-sm w-fit shrink-0 font-semibold text-accent-secondary dark:text-dark-accent-secondary">
              আরো উত্তর দেখুন
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* actions */}
      <View className="px-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-6">
          <LikeButton postId={_id} initialLiked={post.isReacted} />
          <AnswerButton onClick={handleAnswerOpen} />
          <ShareButton />
        </View>
        <BookmarkButton postId={post._id} />
      </View>
    </View>
  );
};

export default QuestionCard;
