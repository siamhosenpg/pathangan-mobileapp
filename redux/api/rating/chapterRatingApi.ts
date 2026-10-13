import { baseApi } from "@/redux/api/baseApi";

// ===================== TYPES =====================
export interface ChapterRatingResponse {
  success: boolean;
  chapterId: string;
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
  isOwner: boolean;
}

export interface HandoutRatingResponse {
  success: boolean;
  handoutId: string;
  averageRating: number;
  ratingCount: number;
}

export interface GiveChapterRatingRequest {
  chapterId: string;
  rating: number; // 1 - 5
  handoutId?: string; // দিলে handout এর average ও সাথে সাথে বদলাবে
}

export interface GiveChapterRatingResponse {
  success: boolean;
  message: string;
  chapterId: string;
  handoutId: string;
  userRating: number;
  averageRating: number;
  ratingCount: number;
  handoutAverageRating: number;
  handoutRatingCount: number;
}

export interface DeleteChapterRatingRequest {
  chapterId: string;
  handoutId?: string;
}

export interface DeleteChapterRatingResponse {
  success: boolean;
  message: string;
  chapterId: string;
  handoutId: string;
  handoutAverageRating: number;
  handoutRatingCount: number;
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

// ===================== API =====================
const chapterRatingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== chapter এর rating + আমার rating =====================
    getChapterRating: builder.query<ChapterRatingResponse, string>({
      query: (chapterId) => ({
        url: `/chapter-ratings/${chapterId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, chapterId) => [
        { type: "Chapter" as const, id: `RATING-${chapterId}` },
      ],
    }),

    // ===================== handout এর average (chapter গুলো মিলিয়ে) =====================
    getHandoutRating: builder.query<HandoutRatingResponse, string>({
      query: (handoutId) => ({
        url: `/chapter-ratings/handout/${handoutId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, handoutId) => [
        { type: "Handout" as const, id: `RATING-${handoutId}` },
      ],
    }),

    // ===================== rating দেওয়া / বদলানো =====================
    giveChapterRating: builder.mutation<
      GiveChapterRatingResponse,
      GiveChapterRatingRequest
    >({
      query: ({ chapterId, rating }) => ({
        url: `/chapter-ratings/${chapterId}`,
        method: "PUT",
        body: { rating },
      }),

      // ✅ Optimistic update: server এর উত্তরের আগেই UI বদলে যাবে
      async onQueryStarted(
        { chapterId, rating, handoutId },
        { dispatch, queryFulfilled },
      ) {
        let previous = 0;
        const patches: { undo: () => void }[] = [];

        // chapter এর নিজের rating + average একসাথে
        patches.push(
          dispatch(
            (baseApi as any).util.updateQueryData(
              "getChapterRating",
              chapterId,
              (draft: ChapterRatingResponse) => {
                previous = draft.userRating ?? 0;
                draft.userRating = rating;
                applyGive(draft, previous, rating);
              },
            ),
          ),
        );

        // handout এর average (handoutId দিলে)
        if (handoutId) {
          patches.push(
            dispatch(
              (baseApi as any).util.updateQueryData(
                "getHandoutRating",
                handoutId,
                (draft: HandoutRatingResponse) => {
                  applyGive(draft, previous, rating);
                },
              ),
            ),
          );
        }

        let data: GiveChapterRatingResponse;
        try {
          ({ data } = await queryFulfilled);
        } catch {
          // fail করলে আগের অবস্থায় ফেরত
          patches.forEach((p) => p.undo());
          return;
        }

        // server এর আসল মান দিয়ে cache সঠিক করে নেওয়া (refetch ছাড়াই)
        dispatch(
          (baseApi as any).util.updateQueryData(
            "getChapterRating",
            chapterId,
            (draft: ChapterRatingResponse) => {
              draft.userRating = data.userRating;
              draft.averageRating = data.averageRating;
              draft.ratingCount = data.ratingCount;
            },
          ),
        );
        dispatch(
          (baseApi as any).util.updateQueryData(
            "getHandoutRating",
            data.handoutId,
            (draft: HandoutRatingResponse) => {
              draft.averageRating = data.handoutAverageRating;
              draft.ratingCount = data.handoutRatingCount;
            },
          ),
        );
      },

      // উপরে নিজেই cache update হচ্ছে, তাই আলাদা invalidate লাগবে না
    }),

    // ===================== rating মুছে ফেলা =====================
    deleteChapterRating: builder.mutation<
      DeleteChapterRatingResponse,
      DeleteChapterRatingRequest
    >({
      query: ({ chapterId }) => ({
        url: `/chapter-ratings/${chapterId}`,
        method: "DELETE",
      }),

      // ✅ Optimistic update
      async onQueryStarted(
        { chapterId, handoutId },
        { dispatch, queryFulfilled },
      ) {
        let previous = 0;
        const patches: { undo: () => void }[] = [];

        patches.push(
          dispatch(
            (baseApi as any).util.updateQueryData(
              "getChapterRating",
              chapterId,
              (draft: ChapterRatingResponse) => {
                previous = draft.userRating ?? 0;
                draft.userRating = null;
                applyRemove(draft, previous);
              },
            ),
          ),
        );

        if (handoutId) {
          patches.push(
            dispatch(
              (baseApi as any).util.updateQueryData(
                "getHandoutRating",
                handoutId,
                (draft: HandoutRatingResponse) => {
                  applyRemove(draft, previous);
                },
              ),
            ),
          );
        }

        let data: DeleteChapterRatingResponse;
        try {
          ({ data } = await queryFulfilled);
        } catch {
          patches.forEach((p) => p.undo());
          return;
        }

        // handout এর আসল মান server থেকে এসেছে, সেটা বসিয়ে দেওয়া
        dispatch(
          (baseApi as any).util.updateQueryData(
            "getHandoutRating",
            data.handoutId,
            (draft: HandoutRatingResponse) => {
              draft.averageRating = data.handoutAverageRating;
              draft.ratingCount = data.handoutRatingCount;
            },
          ),
        );
      },

      // delete এর response এ chapter এর নতুন average আসে না, তাই সেটা একবার refetch হবে
      // (data মুছে যায় না, তাই UI তে কোনো ঝলকানি হবে না)
      invalidatesTags: (result, _error, { chapterId }) =>
        result ? [{ type: "Chapter" as const, id: `RATING-${chapterId}` }] : [],
    }),
  }),
});

export const {
  useGetChapterRatingQuery,
  useGetHandoutRatingQuery,
  useGiveChapterRatingMutation,
  useDeleteChapterRatingMutation,
} = chapterRatingApi;
