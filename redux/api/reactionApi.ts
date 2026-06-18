import {
  ICheckUserLikedResponse,
  IGetReactionsResponse,
  IReactionCountResponse,
  IToggleReactionResponse,
} from "@/types/reactionTypes";
import { baseApi } from "./baseApi";

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
        const patches: Array<{ undo: () => void }> = [];

        const tryPatch = (patchFn: () => { undo: () => void }) => {
          try {
            patches.push(patchFn());
          } catch {}
        };

        // ── 1. Home Feed (getPosts) ──────────────────────────
        tryPatch(() =>
          dispatch(
            baseApi.util.updateQueryData(
              "getPosts" as never,
              { limit: 10 } as never,
              (draft: any) => {
                if (!draft?.pages) return;
                for (const page of draft.pages) {
                  const post = page.posts?.find((p: any) => p._id === postId);
                  if (post) {
                    const wasLiked = post.isReacted;
                    post.isReacted = !wasLiked;
                    post.likesCount = wasLiked
                      ? post.likesCount - 1
                      : post.likesCount + 1;
                  }
                }
              },
            ),
          ),
        );

        // ── 2. Single Post (getPostById) ─────────────────────
        tryPatch(() =>
          dispatch(
            baseApi.util.updateQueryData(
              "getPostById" as never,
              postId as never,
              (draft: any) => {
                if (!draft) return;
                const wasLiked = draft.isReacted;
                draft.isReacted = !wasLiked;
                draft.likesCount = wasLiked
                  ? draft.likesCount - 1
                  : draft.likesCount + 1;
              },
            ),
          ),
        );

        // ── 3. All Questions (infinite) ──────────────────────
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
                  if (post) {
                    const wasLiked = post.isReacted;
                    post.isReacted = !wasLiked;
                    post.likesCount = wasLiked
                      ? post.likesCount - 1
                      : post.likesCount + 1;
                  }
                }
              },
            ),
          ),
        );

        // ── 4. Single Question (getQuestionById) ─────────────
        tryPatch(() =>
          dispatch(
            baseApi.util.updateQueryData(
              "getQuestionById" as never,
              postId as never,
              (draft: any) => {
                if (!draft) return;
                const wasLiked = draft.isReacted;
                draft.isReacted = !wasLiked;
                draft.likesCount = wasLiked
                  ? draft.likesCount - 1
                  : draft.likesCount + 1;
              },
            ),
          ),
        );

        // ── 5. ✅ Profile Feed (getPostsByUserId) ─────────────
        // getState() দিয়ে সব active cache entries খুঁজে বের করো
        const state = getState() as any;
        const queryCacheEntries = state[baseApi.reducerPath]?.queries ?? {};

        for (const [_key, entry] of Object.entries(queryCacheEntries)) {
          const cacheEntry = entry as any;
          // শুধু getPostsByUserId এর active cache গুলো ধরো
          if (
            cacheEntry?.endpointName !== "getPostsByUserId" ||
            cacheEntry?.status !== "fulfilled"
          )
            continue;

          const originalArg = cacheEntry.originalArgs;

          tryPatch(() =>
            dispatch(
              baseApi.util.updateQueryData(
                "getPostsByUserId" as never,
                originalArg as never,
                (draft: any) => {
                  if (!draft?.pages) return;
                  for (const page of draft.pages) {
                    const post = page.posts?.find((p: any) => p._id === postId);
                    if (post) {
                      const wasLiked = post.isReacted;
                      post.isReacted = !wasLiked;
                      post.likesCount = wasLiked
                        ? post.likesCount - 1
                        : post.likesCount + 1;
                      break;
                    }
                  }
                },
              ),
            ),
          );
        }

        try {
          await queryFulfilled;
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
