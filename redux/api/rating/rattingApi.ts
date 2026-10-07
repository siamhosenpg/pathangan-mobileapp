import { baseApi } from "../baseApi";

// ===================== TYPES =====================
export interface RatingStats {
  answerId: string;
  averageRating: number;
  ratingCount: number;
}

export interface GiveRatingResponse {
  success: boolean;
  message: string;
  userRating: number;
  averageRating: number;
  ratingCount: number;
  answerUserId?: string; // যার answer এ rating পড়েছে তার _id
}

export interface GiveRatingRequest {
  answerId: string;
  rating: number; // 1 - 5
}

export interface MyRatingResponse {
  success: true;
  userRating: number | null;
}

export interface DeleteRatingResponse {
  success: boolean;
  message: string;
  answerUserId?: string;
}

export interface AnswerRatingItem {
  answerId: string;
  averageRating: number;
  ratingCount: number;
}

export interface QuestionRatingsResponse {
  success: boolean;
  questionId: string;
  answerRatings: AnswerRatingItem[];
}

export interface UserAverageRatingResponse {
  success: boolean;
  userId: string;
  averageRating: number;
  totalRatingCount: number;
}

// ===================== HELPERS =====================
// নতুন rating বসালে average ও count কী হবে তা হিসাব করা
const applyGive = (
  stats: { averageRating: number; ratingCount: number },
  previous: number,
  next: number,
) => {
  const total = stats.averageRating * stats.ratingCount;
  if (previous > 0) {
    // আগের rating বদলে নতুনটা বসছে, count একই থাকবে
    stats.averageRating =
      stats.ratingCount > 0 ? (total - previous + next) / stats.ratingCount : 0;
  } else {
    stats.ratingCount += 1;
    stats.averageRating = (total + next) / stats.ratingCount;
  }
};

// rating সরালে average ও count কী হবে তা হিসাব করা
const applyRemove = (
  stats: { averageRating: number; ratingCount: number },
  previous: number,
) => {
  if (previous <= 0 || stats.ratingCount <= 0) return;
  const total = stats.averageRating * stats.ratingCount;
  stats.ratingCount -= 1;
  stats.averageRating =
    stats.ratingCount > 0 ? (total - previous) / stats.ratingCount : 0;
};

// ===================== RATING API =====================
export const ratingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /ratings/answer/:answerId — rating দেওয়া বা update করা
    giveRating: builder.mutation<GiveRatingResponse, GiveRatingRequest>({
      query: ({ answerId, rating }) => ({
        url: `/ratings/answer/${answerId}`,
        method: "POST",
        body: { rating },
      }),

      // ✅ Optimistic update: server এর উত্তরের আগেই UI বদলে যাবে
      async onQueryStarted({ answerId, rating }, { dispatch, queryFulfilled }) {
        let previous = 0;

        const myRatingPatch = dispatch(
          (baseApi as any).util.updateQueryData(
            "getMyRating",
            answerId,
            (draft: MyRatingResponse) => {
              previous = draft.userRating ?? 0;
              draft.userRating = rating;
            },
          ),
        );

        const statsPatch = dispatch(
          (baseApi as any).util.updateQueryData(
            "getRatingsByAnswer",
            answerId,
            (draft: RatingStats) => {
              applyGive(draft, previous, rating);
            },
          ),
        );

        try {
          const { data } = await queryFulfilled;

          // server এর আসল মান দিয়ে cache সঠিক করে নেওয়া (refetch ছাড়াই)
          dispatch(
            (baseApi as any).util.updateQueryData(
              "getMyRating",
              answerId,
              (draft: MyRatingResponse) => {
                draft.userRating = data.userRating;
              },
            ),
          );
          dispatch(
            (baseApi as any).util.updateQueryData(
              "getRatingsByAnswer",
              answerId,
              (draft: RatingStats) => {
                draft.averageRating = data.averageRating;
                draft.ratingCount = data.ratingCount;
              },
            ),
          );
        } catch {
          // fail করলে আগের অবস্থায় ফেরত
          myRatingPatch.undo();
          statsPatch.undo();
        }
      },

      // answer/my tag আর invalidate করার দরকার নেই (উপরে নিজেই update হচ্ছে)
      // শুধু profile এর rating refresh করার জন্য User tag
      invalidatesTags: (result) =>
        result?.answerUserId
          ? [
              { type: "User" as const, id: result.answerUserId },
              { type: "Rating" as const, id: `USER_${result.answerUserId}` },
            ]
          : [],
    }),

    // GET /ratings/answer/:answerId — answer এর average rating ও count
    getRatingsByAnswer: builder.query<RatingStats, string>({
      query: (answerId) => `/ratings/answer/${answerId}`,
      providesTags: (_result, _error, answerId) => [
        { type: "Rating", id: answerId },
      ],
    }),

    // GET /ratings/answer/:answerId/my — আমার নিজের rating
    getMyRating: builder.query<MyRatingResponse, string>({
      query: (answerId) => `/ratings/answer/${answerId}/my`,
      providesTags: (_result, _error, answerId) => [
        { type: "Rating", id: `MY_${answerId}` },
      ],
    }),

    // DELETE /ratings/answer/:answerId — rating সরিয়ে দেওয়া
    deleteRating: builder.mutation<DeleteRatingResponse, string>({
      query: (answerId) => ({
        url: `/ratings/answer/${answerId}`,
        method: "DELETE",
      }),

      // ✅ Optimistic update
      async onQueryStarted(answerId, { dispatch, queryFulfilled }) {
        let previous = 0;

        const myRatingPatch = dispatch(
          (baseApi as any).util.updateQueryData(
            "getMyRating",
            answerId,
            (draft: MyRatingResponse) => {
              previous = draft.userRating ?? 0;
              draft.userRating = null;
            },
          ),
        );

        const statsPatch = dispatch(
          (baseApi as any).util.updateQueryData(
            "getRatingsByAnswer",
            answerId,
            (draft: RatingStats) => {
              applyRemove(draft, previous);
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          myRatingPatch.undo();
          statsPatch.undo();
        }
      },

      // delete এর response এ নতুন average আসে না, তাই stats টা একবার refetch হবে
      // (data মুছে যায় না, তাই UI তে কোনো flicker হবে না)
      invalidatesTags: (result, _error, answerId) => [
        { type: "Rating", id: answerId },
        ...(result?.answerUserId
          ? [
              { type: "User" as const, id: result.answerUserId },
              { type: "Rating" as const, id: `USER_${result.answerUserId}` },
            ]
          : []),
      ],
    }),

    // GET /ratings/question/:questionId — question এর সব answer এর rating
    getRatingsByQuestion: builder.query<QuestionRatingsResponse, string>({
      query: (questionId) => `/ratings/question/${questionId}`,
      providesTags: (_result, _error, questionId) => [
        { type: "Rating", id: `QUESTION_${questionId}` },
      ],
    }),

    // GET /ratings/user/:userId — user এর average rating
    getUserAverageRating: builder.query<UserAverageRatingResponse, string>({
      query: (userId) => `/ratings/user/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Rating", id: `USER_${userId}` },
      ],
    }),
  }),
});

export const {
  useGiveRatingMutation,
  useGetRatingsByAnswerQuery,
  useGetMyRatingQuery,
  useDeleteRatingMutation,
  useGetRatingsByQuestionQuery,
  useGetUserAverageRatingQuery,
} = ratingApi;
