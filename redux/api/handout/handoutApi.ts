import type {
  GetHandoutBySlugResponse,
  GetHandoutsArgs,
  GetHandoutsResponse,
  Handout,
  HandoutResponse,
  SimpleSuccessResponse,
} from "@/types/handoutTypes";
import { baseApi } from "../baseApi";

const handoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== ফিড (Infinite Query) =====================
    // ===================== ফিড (Infinite Query) =====================
    getAllHandoutsInfinite: builder.infiniteQuery<
      GetHandoutsResponse,
      GetHandoutsArgs,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
          lastPage.hasMore ? lastPage.nextCursor : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: "/handouts",
        method: "GET",
        params: {
          // ✅ cursor null হলে param-ই পাঠানো হবে না
          ...(pageParam ? { cursor: pageParam } : {}),
          limit: 10,
          category: queryArg.category ?? undefined,
          search: queryArg.search ?? undefined,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.pages.flatMap((page) =>
                page.data.map((h) => ({
                  type: "Handout" as const,
                  id: h._id,
                })),
              ),
              { type: "Handout" as const, id: "LIST" },
            ]
          : [{ type: "Handout" as const, id: "LIST" }],
    }),
    // ===================== নিজের হ্যান্ডআউট লিস্ট =====================
    // ===================== নিজের হ্যান্ডআউট লিস্ট =====================
    getMyHandouts: builder.query<
      GetHandoutsResponse,
      { status?: "draft" | "published"; cursor?: string | null }
    >({
      query: ({ status, cursor }) => ({
        url: "/handouts/mine",
        method: "GET",
        params: {
          status: status ?? undefined,
          // ✅ cursor null/undefined হলে param পাঠানো হবে না
          ...(cursor ? { cursor } : {}),
          limit: 20,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((h) => ({
                type: "Handout" as const,
                id: h._id,
              })),
              { type: "Handout" as const, id: "MY_LIST" },
            ]
          : [{ type: "Handout" as const, id: "MY_LIST" }],
    }),

    // ===================== slug দিয়ে একটা হ্যান্ডআউট (chapters TOC সহ) =====================
    getHandoutBySlug: builder.query<GetHandoutBySlugResponse, string>({
      query: (slug) => ({
        url: `/handouts/${slug}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result ? [{ type: "Handout", id: result.data._id }] : [],
    }),

    // ===================== তৈরি =====================
    createHandout: builder.mutation<HandoutResponse, FormData>({
      query: (formData) => ({
        url: "/handouts",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        { type: "Handout", id: "LIST" },
        { type: "Handout", id: "MY_LIST" },
      ],
    }),
    // ===================== আপডেট =====================
    updateHandout: builder.mutation<
      HandoutResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/handouts/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Handout", id },
        { type: "Handout", id: "MY_LIST" },
      ],
    }),

    // ===================== পাবলিশ =====================
    publishHandout: builder.mutation<HandoutResponse, string>({
      query: (id) => ({
        url: `/handouts/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Handout", id },
        { type: "Handout", id: "LIST" },
        { type: "Handout", id: "MY_LIST" },
      ],
    }),

    // ===================== সফট ডিলিট =====================
    deleteHandout: builder.mutation<SimpleSuccessResponse, string>({
      query: (id) => ({
        url: `/handouts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Handout", id },
        { type: "Handout", id: "LIST" },
        { type: "Handout", id: "MY_LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllHandoutsInfiniteInfiniteQuery,
  useGetMyHandoutsQuery,
  useGetHandoutBySlugQuery,
  useCreateHandoutMutation,
  useUpdateHandoutMutation,
  usePublishHandoutMutation,
  useDeleteHandoutMutation,
} = handoutApi;

export type { Handout };
