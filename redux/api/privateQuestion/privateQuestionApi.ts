import { baseApi } from "@/redux/api/baseApi";
import type {
  DeleteQuestionResponse,
  EditPrivateQuestionRequest,
  GetPeopleParams,
  GetQuestionsParams,
  GetThreadParams,
  PrivateQuestionListResponse,
  PrivateQuestionPeopleResponse,
  PrivateQuestionSingleResponse,
  PrivateQuestionThreadResponse,
  SendPrivateQuestionRequest,
  UnreadCountResponse,
  UpdateQuestionStatusRequest,
  UpdateStatusResponse,
} from "@/types/privateQuestionTypes";

export const privateQuestionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== SEND QUESTION =====================
    sendPrivateQuestion: builder.mutation<
      PrivateQuestionSingleResponse,
      SendPrivateQuestionRequest
    >({
      query: (body) => ({
        url: "/private-questions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PrivateQuestion"],
    }),

    // ===================== GET INBOX (flat) =====================
    getInbox: builder.infiniteQuery<
      PrivateQuestionListResponse,
      GetQuestionsParams | void,
      string | null
    >({
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams();

        if (pageParam) params.set("cursor", pageParam);
        if (queryArg?.limit) params.set("limit", String(queryArg.limit));
        if (queryArg?.status) params.set("status", queryArg.status);

        return `/private-questions/inbox?${params.toString()}`;
      },
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      providesTags: ["PrivateQuestion"],
    }),

    // ===================== GET SENT (flat) =====================
    getSentQuestions: builder.infiniteQuery<
      PrivateQuestionListResponse,
      GetQuestionsParams | void,
      string | null
    >({
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams();

        if (pageParam) params.set("cursor", pageParam);
        if (queryArg?.limit) params.set("limit", String(queryArg.limit));

        return `/private-questions/sent?${params.toString()}`;
      },
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      providesTags: ["PrivateQuestion"],
    }),

    // ===================== PEOPLE LIST (infinite) =====================
    getPrivateQuestionPeople: builder.infiniteQuery<
      PrivateQuestionPeopleResponse,
      GetPeopleParams,
      string | null
    >({
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams();

        params.set("mode", queryArg.mode);
        if (pageParam) params.set("cursor", pageParam);
        if (queryArg.limit) params.set("limit", String(queryArg.limit));

        return `/private-questions/people?${params.toString()}`;
      },
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      providesTags: ["PrivateQuestion"],
    }),

    // ===================== একজনের সাথে প্রশ্নগুলো (infinite) =====================
    getQuestionsWithUser: builder.infiniteQuery<
      PrivateQuestionThreadResponse,
      GetThreadParams,
      string | null
    >({
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams();

        params.set("mode", queryArg.mode);
        if (pageParam) params.set("cursor", pageParam);
        if (queryArg.limit) params.set("limit", String(queryArg.limit));

        return `/private-questions/with/${queryArg.userId}?${params.toString()}`;
      },
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      providesTags: ["PrivateQuestion", "PrivateAnswer"],
    }),

    // ===================== UNREAD COUNT =====================
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "/private-questions/unread-count",
      providesTags: ["PrivateQuestion"],
    }),

    // ===================== SINGLE QUESTION =====================
    getPrivateQuestionById: builder.query<
      PrivateQuestionSingleResponse,
      string
    >({
      query: (id) => `/private-questions/${id}`,
      providesTags: (_result, _err, id) => [{ type: "PrivateQuestion", id }],
    }),

    // ===================== EDIT QUESTION =====================
    editPrivateQuestion: builder.mutation<
      PrivateQuestionSingleResponse,
      EditPrivateQuestionRequest
    >({
      query: ({ id, questionText }) => ({
        url: `/private-questions/${id}`,
        method: "PATCH",
        body: { questionText },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        "PrivateQuestion",
        { type: "PrivateQuestion", id },
      ],
    }),

    // ===================== UPDATE STATUS =====================
    updateQuestionStatus: builder.mutation<
      UpdateStatusResponse,
      UpdateQuestionStatusRequest
    >({
      query: ({ id, status }) => ({
        url: `/private-questions/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        "PrivateQuestion",
        { type: "PrivateQuestion", id },
      ],
    }),

    // ===================== SOFT DELETE QUESTION =====================
    // প্রশ্ন গেলে উত্তর আর rating ও যায়, তাই সংশ্লিষ্ট tag গুলোও invalidate
    deletePrivateQuestion: builder.mutation<DeleteQuestionResponse, string>({
      query: (id) => ({
        url: `/private-questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PrivateQuestion", "PrivateAnswer"],
    }),
  }),
});

export const {
  useSendPrivateQuestionMutation,
  useGetInboxInfiniteQuery,
  useGetSentQuestionsInfiniteQuery,
  useGetPrivateQuestionPeopleInfiniteQuery,
  useGetQuestionsWithUserInfiniteQuery,
  useGetUnreadCountQuery,
  useGetPrivateQuestionByIdQuery,
  useEditPrivateQuestionMutation,
  useUpdateQuestionStatusMutation,
  useDeletePrivateQuestionMutation,
} = privateQuestionApi;
