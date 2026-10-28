import {
  ICheckUserLikedResponse,
  IGetReactionsResponse,
  IReactionCountResponse,
  IToggleReactionResponse,
} from "@/types/reactionTypes";
import { baseApi } from "./baseApi";

// optimistic: শুধু উল্টে দেয়
const toggleLikeOnPost = (post: any) => {
  const wasLiked = post.isReacted;
  post.isReacted = !wasLiked;
  post.likesCount = wasLiked
    ? Math.max(0, (post.likesCount ?? 0) - 1)
    : (post.likesCount ?? 0) + 1;
};

// server-sync: নির্দিষ্ট মানে সেট করে। আগে থেকে মিলে গেলে কিছুই করে না
const setLikeOnPost = (post: any, liked: boolean) => {
  if (!!post.isReacted === liked) return;
  post.isReacted = liked;
  post.likesCount = liked
    ? (post.likesCount ?? 0) + 1
    : Math.max(0, (post.likesCount ?? 0) - 1);
};

export const reactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🟢 Toggle Like
    toggleReaction: builder.mutation<IToggleReactionResponse, string>({
      query: (postId) => ({
        url: "/reactions/toggle",
        method: "POST",
        body: { postId },
      }),

      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        // সব cache-এ একই updater চালায়, patch গুলো ফেরত দেয়
        const applyEverywhere = (updater: (post: any) => void) => {
          const patches: Array<{ undo: () => void }> = [];

          const tryPatch = (patchFn: () => { undo: () => void }) => {
            try {
              patches.push(patchFn());
            } catch {}
          };

          // 1. Home Feed
          tryPatch(() =>
            dispatch(
              baseApi.util.updateQueryData(
                "getPosts" as never,
                { limit: 10 } as never,
                (draft: any) => {
                  if (!draft?.pages) return;
                  for (const page of draft.pages) {
                    const post = page.posts?.find((p: any) => p._id === postId);
                    if (post) updater(post);
                  }
                },
              ),
            ),
          );

          // 2. Single Post
          tryPatch(() =>
            dispatch(
              baseApi.util.updateQueryData(
                "getPostById" as never,
                postId as never,
                (draft: any) => {
                  if (draft) updater(draft);
                },
              ),
            ),
          );

          // 3. All Questions
          tryPatch(() =>
            dispatch(
              baseApi.util.updateQueryData(
                "getAllQuestions" as never,
                { limit: 10 } as never,
                (draft: any) => {
                  if (!draft?.pages) return;
                  for (const page of draft.pages) {
                    const post = page.questions?.find(
                      (p: any) => p._id === postId,
                    );
                    if (post) updater(post);
                  }
                },
              ),
            ),
          );

          // 4. Single Question
          tryPatch(() =>
            dispatch(
              baseApi.util.updateQueryData(
                "getQuestionById" as never,
                postId as never,
                (draft: any) => {
                  if (draft) updater(draft);
                },
              ),
            ),
          );

          // 5 & 6. Dynamic cache entries (Profile Feed + Saved)
          const state = getState() as any;
          const queryCacheEntries = state[baseApi.reducerPath]?.queries ?? {};

          for (const entry of Object.values(queryCacheEntries)) {
            const cacheEntry = entry as any;
            if (cacheEntry?.status !== "fulfilled") continue;

            const originalArg = cacheEntry.originalArgs;

            if (cacheEntry.endpointName === "getPostsByUserId") {
              tryPatch(() =>
                dispatch(
                  baseApi.util.updateQueryData(
                    "getPostsByUserId" as never,
                    originalArg as never,
                    (draft: any) => {
                      if (!draft?.pages) return;
                      for (const page of draft.pages) {
                        const post = page.posts?.find(
                          (p: any) => p._id === postId,
                        );
                        if (post) {
                          updater(post);
                          break;
                        }
                      }
                    },
                  ),
                ),
              );
            }

            if (cacheEntry.endpointName === "getSavedItems") {
              tryPatch(() =>
                dispatch(
                  baseApi.util.updateQueryData(
                    "getSavedItems" as never,
                    originalArg as never,
                    (draft: any) => {
                      if (!draft?.pages) return;
                      for (const page of draft.pages) {
                        for (const item of page.items ?? []) {
                          const post = item?.postId;
                          if (post && post._id === postId) updater(post);
                        }
                      }
                    },
                  ),
                ),
              );
            }
          }

          return patches;
        };

        // ── Optimistic: আগে উল্টে দাও ──
        const patches = applyEverywhere(toggleLikeOnPost);

        try {
          const { data } = await queryFulfilled;

          // ── Server যা বলল সেটাই সত্য: cache ভুল থাকলে ঠিক করে দাও ──
          if (typeof data?.liked === "boolean") {
            applyEverywhere((post) => setLikeOnPost(post, data.liked));
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    // 🟣 Get reactions list
    getReactionsByPost: builder.query<IGetReactionsResponse, string>({
      query: (postId) => `/reactions/post/${postId}`,
      providesTags: (_result, _error, postId) => [{ type: "Post", id: postId }],
    }),

    // 🟡 Get count
    getReactionCount: builder.query<IReactionCountResponse, string>({
      query: (postId) => `/reactions/count/${postId}`,
      providesTags: (_result, _error, postId) => [
        { type: "Post", id: postId },
        { type: "Reaction", id: postId },
      ],
    }),

    // ── এটা আর use হচ্ছে না, তবে রাখা আছে পুরনো code এর জন্য
    checkUserLiked: builder.query<ICheckUserLikedResponse, string>({
      query: (postId) => `/reactions/check/${postId}`,
      providesTags: (_result, _error, postId) => [
        { type: "Reaction", id: postId },
      ],
    }),
  }),
});

export const {
  useToggleReactionMutation,
  useGetReactionsByPostQuery,
  useGetReactionCountQuery,
  useCheckUserLikedQuery,
} = reactionApi;
