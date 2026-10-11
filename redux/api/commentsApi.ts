import { baseApi } from "./baseApi";
import { postApi } from "./postApi";

import type {
  Comment,
  CreateCommentRequest,
  GetCommentsResponse,
  GetRepliesResponse,
  UpdateCommentRequest,
} from "@/types/commentsTypes";

const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== GET COMMENTS (infinite style) =====================
    getCommentsByPost: builder.query<
      GetCommentsResponse,
      { postId: string; page?: number; limit?: number }
    >({
      query: ({ postId, page = 1, limit = 10 }) => ({
        url: `/comments/${postId}`,
        params: { page, limit },
      }),
      serializeQueryArgs: ({ queryArgs }) => queryArgs.postId,
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.data.map((c) => c._id));
        return {
          ...newItems,
          data: [
            ...currentCache.data,
            ...newItems.data.filter((c) => !existingIds.has(c._id)),
          ],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result, error, { postId }) => [
        { type: "Comment", id: postId },
      ],
    }),

    // ===================== GET REPLIES (infinite style) =====================
    getRepliesByComment: builder.query<
      GetRepliesResponse,
      { commentId: string; page?: number; limit?: number }
    >({
      query: ({ commentId, page = 1, limit = 5 }) => ({
        url: `/comments/replies/${commentId}`,
        params: { page, limit },
      }),
      serializeQueryArgs: ({ queryArgs }) => queryArgs.commentId,
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.data.map((c) => c._id));
        return {
          ...newItems,
          data: [
            ...currentCache.data,
            ...newItems.data.filter((c) => !existingIds.has(c._id)),
          ],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result, error, { commentId }) => [
        { type: "Comment", id: `replies-${commentId}` },
      ],
    }),

    // ===================== CREATE COMMENT / REPLY =====================
    createComment: builder.mutation<
      { success: boolean; data: Comment },
      CreateCommentRequest
    >({
      query: (body) => ({
        url: `/comments`,
        method: "POST",
        body,
      }),

      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const created = data.data;
          // backend সবসময় root comment এর id ফেরত দেয় (reply এর reply হলেও)
          const rootId = created.parentCommentId;

          if (!rootId) {
            // নতুন root comment → তালিকার শুরুতে
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                { postId, page: 1, limit: 10 },
                (draft) => {
                  draft.data.unshift(created);
                  draft.total += 1;
                  draft.count += 1;
                },
              ),
            );

            dispatch(
              postApi.util.updateQueryData(
                "getPosts",
                { limit: 10 },
                (draft: any) => {
                  if (!draft?.pages) return;

                  for (const page of draft.pages) {
                    const post = page.posts?.find((p: any) => p._id === postId);
                    if (post) {
                      post.commentsCount += 1;
                      break;
                    }
                  }
                },
              ),
            );
          } else {
            // reply → replies cache এর শেষে (cache থাকলে)
            dispatch(
              commentApi.util.updateQueryData(
                "getRepliesByComment",
                { commentId: rootId, page: 1, limit: 5 },
                (draft) => {
                  if (!draft.data.some((c) => c._id === created._id)) {
                    draft.data.push(created);
                  }
                  draft.totalReplies += 1;
                  draft.count += 1;
                },
              ),
            );

            // root comment এর repliesCount বাড়ানো
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                { postId, page: 1, limit: 10 },
                (draft) => {
                  const root = draft.data.find((c) => c._id === rootId);
                  if (root) root.repliesCount = (root.repliesCount ?? 0) + 1;
                },
              ),
            );
          }
        } catch {}
      },
    }),

    // ===================== UPDATE COMMENT =====================
    updateComment: builder.mutation<
      { success: boolean; data: Comment },
      UpdateCommentRequest
    >({
      query: ({ commentId, text }) => ({
        url: `/comments/${commentId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),

    // ===================== DELETE COMMENT / REPLY =====================
    deleteComment: builder.mutation<
      { success: boolean; message: string },
      {
        commentId: string;
        postId: string;
        parentCommentId?: string | null;
      }
    >({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),

      async onQueryStarted(
        { commentId, postId, parentCommentId },
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;

          if (!parentCommentId) {
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                { postId, page: 1, limit: 10 },
                (draft) => {
                  draft.data = draft.data.filter((c) => c._id !== commentId);
                  draft.total = Math.max(0, draft.total - 1);
                  draft.count = Math.max(0, draft.count - 1);
                },
              ),
            );

            dispatch(
              postApi.util.updateQueryData(
                "getPosts",
                { limit: 10 },
                (draft: any) => {
                  if (!draft?.pages) return;

                  for (const page of draft.pages) {
                    const post = page.posts?.find((p: any) => p._id === postId);
                    if (post) {
                      post.commentsCount = Math.max(0, post.commentsCount - 1);
                      break;
                    }
                  }
                },
              ),
            );
          } else {
            dispatch(
              commentApi.util.updateQueryData(
                "getRepliesByComment",
                { commentId: parentCommentId, page: 1, limit: 5 },
                (draft) => {
                  draft.data = draft.data.filter((c) => c._id !== commentId);
                  draft.totalReplies = Math.max(0, draft.totalReplies - 1);
                  draft.count = Math.max(0, draft.count - 1);
                },
              ),
            );

            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                { postId, page: 1, limit: 10 },
                (draft) => {
                  const root = draft.data.find(
                    (c) => c._id === parentCommentId,
                  );
                  if (root) {
                    root.repliesCount = Math.max(
                      0,
                      (root.repliesCount ?? 0) - 1,
                    );
                  }
                },
              ),
            );
          }
        } catch {}
      },
    }),
  }),
});

export const {
  useGetCommentsByPostQuery,
  useGetRepliesByCommentQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;

export default commentApi;
