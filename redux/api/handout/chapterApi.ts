import type {
  AddChapterRequest,
  ChapterResponse,
  DeleteChapterRequest,
  GetChaptersResponse,
  ReorderChaptersRequest,
  SimpleSuccessResponse,
  UpdateChapterRequest,
} from "@/types/chapterTypes";
import { baseApi } from "../baseApi";

const chapterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== হ্যান্ডআউটের সব চ্যাপ্টার =====================
    getChaptersByHandout: builder.query<GetChaptersResponse, string>({
      query: (handoutId) => ({
        url: `/chapters/handout/${handoutId}`,
        method: "GET",
      }),
      providesTags: (result, error, handoutId) =>
        result
          ? [
              ...result.data.map((c) => ({
                type: "Chapter" as const,
                id: c._id,
              })),
              { type: "Chapter" as const, id: `LIST-${handoutId}` },
            ]
          : [{ type: "Chapter" as const, id: `LIST-${handoutId}` }],
    }),

    // ===================== চ্যাপ্টার যোগ =====================
    addChapter: builder.mutation<ChapterResponse, AddChapterRequest>({
      query: (body) => ({
        url: "/chapters",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { handoutId }) => [
        { type: "Chapter", id: `LIST-${handoutId}` },
        { type: "Handout", id: handoutId },
      ],
    }),

    // ===================== চ্যাপ্টার আপডেট =====================
    updateChapter: builder.mutation<ChapterResponse, UpdateChapterRequest>({
      query: ({ id, handoutId, ...body }) => ({
        url: `/chapters/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, handoutId }) => [
        { type: "Chapter", id },
        { type: "Chapter", id: `LIST-${handoutId}` },
        { type: "Handout", id: handoutId },
      ],
    }),

    // ===================== চ্যাপ্টার সফট ডিলিট =====================
    deleteChapter: builder.mutation<
      SimpleSuccessResponse,
      DeleteChapterRequest
    >({
      query: ({ id }) => ({
        url: `/chapters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id, handoutId }) => [
        { type: "Chapter", id },
        { type: "Chapter", id: `LIST-${handoutId}` },
        { type: "Handout", id: handoutId },
      ],
    }),

    // ===================== চ্যাপ্টার রিঅর্ডার =====================
    reorderChapters: builder.mutation<
      SimpleSuccessResponse,
      ReorderChaptersRequest
    >({
      query: ({ handoutId, orderedChapterIds }) => ({
        url: `/chapters/reorder/${handoutId}`,
        method: "PUT",
        body: { orderedChapterIds },
      }),
      invalidatesTags: (result, error, { handoutId }) => [
        { type: "Chapter", id: `LIST-${handoutId}` },
      ],
    }),
  }),
});

export const {
  useGetChaptersByHandoutQuery,
  useAddChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useReorderChaptersMutation,
} = chapterApi;
