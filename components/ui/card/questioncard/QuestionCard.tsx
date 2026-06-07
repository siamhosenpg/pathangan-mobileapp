import { Text, TouchableOpacity, View } from "react-native";
import PostCountLeft from "../postcard/PostCountLeft";
import PostProfileTop from "../postcard/PostProfileTop";
// import LikeButton from "../postcard/LikeButton";
// import ShareButton from "../postcard/ShareButton";
// import AnswerButton from "../postcard/AnswerButton";
// import BookmarkButton from "@/components/ui/buttons/BookmarkButton";
// import AnswerPopup from "./AnswerPopup";
import { useGetAnswersByQuestionQuery } from "@/redux/api/answer/answersApi";
import type { Post } from "@/types/postTypes";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";
import AnswerButton from "../../buttons/AnswerButton";
import BookmarkButton from "../../buttons/BookmarkButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";
import AnswerCard from "./AnswerCard";
import AnswerPopupContent from "./AnswerPopupContent";

interface Props {
  post: Post;
}

const QuestionCard = ({ post }: Props) => {
  const { userid, question, createdAt, _id } = post;
  const { open } = useBottomSheet();
  const { data, isLoading } = useGetAnswersByQuestionQuery({
    questionId: _id,
    limit: 2,
  });

  const handleAnswerOpen = () => {
    open(
      <AnswerPopupContent
        questionId={_id}
        questionText={question?.questionText ?? ""}
      />,
    );
  };

  return (
    <View className="bg-background dark:bg-dark-background pt-4">
      <PostProfileTop user={userid} createdAt={createdAt} postId={_id} />

      <Text className="mt-2 px-4 text-text dark:text-dark-text  font-semibold text-base leading-6">
        {question?.questionText}
      </Text>

      {/* answers */}
      <View className="px-4 mt-2 gap-2">
        {isLoading ? (
          <>
            <View className="h-20 rounded-xl bg-background-secondary dark:bg-dark-background-secondary" />
            <View className="h-20 rounded-xl bg-background-secondary dark:bg-dark-background-secondary" />
          </>
        ) : (
          data?.answers.map((answer, index) => (
            <View
              key={answer._id}
              className={
                index !== data.answers.length - 1
                  ? "border-b border-border dark:border-dark-border"
                  : ""
              }
            >
              <AnswerCard answer={answer} questionId={_id} />
            </View>
          ))
        )}
      </View>

      {/* counts */}
      <View className="px-4 py-2 mt-2 border-b border-border dark:border-dark-border flex-row items-center justify-between">
        <PostCountLeft
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          sharesCount={post.sharesCount}
        />
        <TouchableOpacity>
          <Text className="text-sm font-semibold text-accent">
            আরো উত্তর দেখুন
          </Text>
        </TouchableOpacity>
      </View>

      {/* actions */}
      <View className="px-4  flex-row items-center justify-between">
        <View className="flex-row items-center gap-6">
          <LikeButton postId={_id} initialLiked={post.isReacted} />

          <AnswerButton onClick={handleAnswerOpen} />

          <ShareButton />
        </View>
        <BookmarkButton postId={post._id} />
      </View>

      {/* {showAnswerPopup && (
        <AnswerPopup
          questionId={_id}
          questionText={question?.questionText ?? ""}
          onClose={() => setShowAnswerPopup(false)}
        />
      )} */}
    </View>
  );
};

export default QuestionCard;
