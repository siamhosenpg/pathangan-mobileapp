import type {
  SuggestedUsersResponse,
  UpdateUserRequest,
  User,
} from "@/types/userTypes";
import { baseApi } from "./baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({ url: "/users/user", method: "GET" }),
      providesTags: ["User"],
    }),

    getUserByUsername: builder.query<User, string>({
      query: (username) => ({
        url: `/users/user/${username}`,
        method: "GET",
      }),
      providesTags: (_result, _error, username) => [
        { type: "User", id: username },
      ],
    }),

    getSuggestedUsers: builder.query<SuggestedUsersResponse, void>({
      query: () => ({ url: "/users/suggested", method: "GET" }),
      providesTags: ["User"],
    }),

    // ⚠️ Mobile এ FormData image upload এভাবে করতে হয়
    updateUser: builder.mutation<
      { message: string; user: User },
      UpdateUserRequest
    >({
      query: ({ userid, formData }) => ({
        url: `/users/user/${userid}`,
        method: "PUT",
        body: formData,
        headers: {
          Accept: "application/json",
          // Content-Type দেবে না — React Native নিজে boundary set করবে
        },
      }),
      invalidatesTags: (_result, _error, { userid }) => [
        { type: "User", id: String(userid) },
      ],
    }),

    deleteUser: builder.mutation<{ message: string }, number>({
      query: (userid) => ({
        url: `/users/user/${userid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByUsernameQuery,
  useGetSuggestedUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
