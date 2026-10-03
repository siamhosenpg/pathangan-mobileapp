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
      providesTags: (result, _error, username) => [
        { type: "User", id: username },
        ...(result?._id ? [{ type: "User" as const, id: result._id }] : []),
      ],
    }),

    getPeopleSuggestions: builder.query<SuggestedUsersResponse, void>({
      query: () => ({ url: "/peoples/suggestions", method: "GET" }),
    }),

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
          // Content-Type debi na — React Native nije boundary set korbe
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

    savePushToken: builder.mutation<{ message: string }, { pushToken: string }>(
      {
        query: (body) => ({
          url: "/users/push-token",
          method: "POST",
          body,
        }),
      },
    ),

    // logout-er somoy call korbi
    removePushToken: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/users/push-token",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByUsernameQuery,
  useGetPeopleSuggestionsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSavePushTokenMutation,
  useRemovePushTokenMutation,
} = userApi;
