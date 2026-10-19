// redux/api/answer/privateAnswerApi.ts

import { baseApi } from "@/redux/api/baseApi";
import type {
  CreatePrivateAnswerPayload,
  CreatePrivateAnswerResponse,
  DeletePrivateAnswerResponse,
  EditPrivateAnswerPayload,
  EditPrivateAnswerResponse,
  GetPrivateAnswerResponse,
} from "@/types/privateQuestionTypes";

export const privateAnswerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== GET ANSWER BY QUESTION =====================
    getPrivateAnswerByQuestion: builder.query<GetPrivateAnswerResponse, string>(
      {
        query: (questionId) => `/private-answers/${questionId}`,
        providesTags: (_result, _error, questionId) => [
          { type: "PrivateAnswer", id: questionId },
        ],
      },
    ),

    // ===================== CREATE ANSWER =====================
    createPrivateAnswer: builder.mutation<
      CreatePrivateAnswerResponse,
      CreatePrivateAnswerPayload
    >({
      query: ({ questionId, text }) => ({
        url: `/private-answers/${questionId}`,
        method: "POST",
        body: { text },
      }),
      // উত্তর দিলে প্রশ্নের status "answered" হয়, তাই PrivateQuestion ও invalidate
      invalidatesTags: (_result, _error, { questionId }) => [
        { type: "PrivateAnswer", id: questionId },
        "PrivateAnswer",
        "PrivateQuestion",
        { type: "PrivateQuestion", id: questionId },
      ],
    }),

    // ===================== EDIT ANSWER =====================
    editPrivateAnswer: builder.mutation<
      EditPrivateAnswerResponse,
      EditPrivateAnswerPayload
    >({
      query: ({ answerId, text }) => ({
        url: `/private-answers/${answerId}`,
        method: "PATCH",
        body: { text },
      }),
      invalidatesTags: ["PrivateAnswer", "PrivateQuestion"],
    }),

    // ===================== SOFT DELETE ANSWER =====================
    // private এ rating নেই, তাই Rating / User tag লাগে না
    deletePrivateAnswer: builder.mutation<DeletePrivateAnswerResponse, string>({
      query: (answerId) => ({
        url: `/private-answers/${answerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PrivateAnswer", "PrivateQuestion"],
    }),
  }),
});

export const {
  useGetPrivateAnswerByQuestionQuery,
  useCreatePrivateAnswerMutation,
  useEditPrivateAnswerMutation,
  useDeletePrivateAnswerMutation,
} = privateAnswerApi;
