import type {
  GetFeedCategoriesResponse,
  GetForYouFeedResponse,
  GetMyInterestsResponse,
  SetInterestsPayload,
} from "@/types/feedTypes";
import type { Post } from "@/types/postTypes";
import { baseApi } from "./baseApi";

// hook আর updateQueryData দুটোই একই arg ব্যবহার করবে
export const FEED_QUERY_ARGS = { limit: 10 };

// HomeFeed ("সর্বশেষ") cache-এর arg: HomeFeed ও postApi-এর সাথে মিল রাখতে হবে
const HOME_QUERY_ARGS = { limit: 10 };

// cache-এর সব page থেকে একটা post সরানো
const removePostFromPages = (postId: string) => (draft: any) => {
  for (const page of draft.pages) {
    page.posts = page.posts.filter((p: Post) => p._id !== postId);
  }
};

const feedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== FOR YOU FEED (INFINITE) =====================
    getForYouFeed: builder.infiniteQuery<
      GetForYouFeedResponse,
      { limit?: number },
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage: GetForYouFeedResponse) =>
          lastPage.nextCursor ?? null,
      },

      query: ({
        queryArg,
        pageParam,
      }: {
        queryArg: { limit?: number };
        pageParam: string | null;
      }) => ({
        url: "/feed/for-you",
        method: "GET" as const,
        params: {
          cursor: pageParam ?? undefined,
          limit: queryArg.limit ?? 10,
        },
      }),

      // "Post" tag না, নিজস্ব tag: like/post করলে ফিড refetch হয়ে এলোমেলো হবে না
      providesTags: ["Feed"],
    }),

    // ===================== CATEGORIES (বাছাইয়ের তালিকা) =====================
    getFeedCategories: builder.query<GetFeedCategoriesResponse, void>({
      query: () => ({ url: "/feed/categories", method: "GET" as const }),
      keepUnusedDataFor: 3600,
    }),

    // ===================== MY INTERESTS =====================
    getMyInterests: builder.query<GetMyInterestsResponse, void>({
      query: () => ({ url: "/feed/interests", method: "GET" as const }),
      providesTags: ["Interest"],
    }),

    setMyInterests: builder.mutation<
      { success: boolean; selected: string[] },
      SetInterestsPayload
    >({
      query: (body) => ({
        url: "/feed/interests",
        method: "PUT" as const,
        body,
      }),
      invalidatesTags: ["Interest", "Feed"],
    }),

    resetMyInterests: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({ url: "/feed/interests", method: "DELETE" as const }),
      invalidatesTags: ["Interest", "Feed"],
    }),

    // ===================== NOT INTERESTED =====================
    notInterested: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: "/feed/not-interested",
        method: "POST" as const,
        body: { postId },
      }),

      // post সঙ্গে সঙ্গে দুই ফিড থেকে সরে যাবে, সার্ভারে ব্যর্থ হলে ফিরে আসবে
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const util = (baseApi as any).util;

        const patches = [
          dispatch(
            util.updateQueryData(
              "getForYouFeed",
              FEED_QUERY_ARGS,
              removePostFromPages(postId),
            ),
          ),
          dispatch(
            util.updateQueryData(
              "getPosts",
              HOME_QUERY_ARGS,
              removePostFromPages(postId),
            ),
          ),
        ];

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p: any) => p.undo());
        }
      },
    }),
  }),
});

// ফিডের cache-এ একটা post বদলানোর জন্য (like, view ইত্যাদি)।
// dispatch(patchForYouPost(...)) ফেরত দেয় যার .undo() আছে
export const patchForYouPost = (postId: string, recipe: (post: Post) => void) =>
  (baseApi as any).util.updateQueryData(
    "getForYouFeed",
    FEED_QUERY_ARGS,
    (draft: any) => {
      for (const page of draft.pages) {
        const post = page.posts.find((p: Post) => p._id === postId);
        if (post) {
          recipe(post);
          break;
        }
      }
    },
  );

export { feedApi };
export const {
  useGetForYouFeedInfiniteQuery,
  useGetFeedCategoriesQuery,
  useGetMyInterestsQuery,
  useSetMyInterestsMutation,
  useResetMyInterestsMutation,
  useNotInterestedMutation,
} = feedApi;
