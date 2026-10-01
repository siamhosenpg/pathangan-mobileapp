import type {
  FollowersCountResponse,
  FollowingCountResponse,
  FollowingListResponse,
  FollowListArgs,
  FollowListResponse,
  FollowResponse,
  UnfollowResponse,
} from "@/types/followTypes";
import { baseApi } from "./baseApi";

const DEFAULT_LIMIT = 20;

export const followApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    followUser: builder.mutation<FollowResponse, string>({
      query: (userId) => ({
        url: `/follows/follow/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "Follow", id: userId },
        { type: "Follow", id: "FOLLOWERS_COUNT" },
        { type: "Follow", id: "FOLLOWING_COUNT" },
        { type: "Follow", id: "FOLLOWERS_LIST" },
        { type: "Follow", id: "FOLLOWING_LIST" },
      ],
    }),

    unfollowUser: builder.mutation<UnfollowResponse, string>({
      query: (userId) => ({
        url: `/follows/unfollow/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "Follow", id: userId },
        { type: "Follow", id: "FOLLOWERS_COUNT" },
        { type: "Follow", id: "FOLLOWING_COUNT" },
        { type: "Follow", id: "FOLLOWERS_LIST" },
        { type: "Follow", id: "FOLLOWING_LIST" },
      ],
    }),

    // ✅ Cursor pagination: ?limit=20&cursor=<lastId>
    getFollowers: builder.query<FollowListResponse, FollowListArgs>({
      query: ({ userId, cursor, limit = DEFAULT_LIMIT }) => ({
        url: `/follows/followers/${userId}`,
        params: { limit, ...(cursor ? { cursor } : {}) },
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: "Follow", id: "FOLLOWERS_LIST" },
        { type: "Follow", id: userId },
      ],
    }),

    getFollowing: builder.query<FollowingListResponse, FollowListArgs>({
      query: ({ userId, cursor, limit = DEFAULT_LIMIT }) => ({
        url: `/follows/following/${userId}`,
        params: { limit, ...(cursor ? { cursor } : {}) },
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: "Follow", id: "FOLLOWING_LIST" },
        { type: "Follow", id: userId },
      ],
    }),

    getFollowersCount: builder.query<FollowersCountResponse, string>({
      query: (userId) => `/follows/followers/count/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Follow", id: "FOLLOWERS_COUNT" },
        { type: "Follow", id: userId },
      ],
    }),

    getFollowingCount: builder.query<FollowingCountResponse, string>({
      query: (userId) => `/follows/following/count/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Follow", id: "FOLLOWING_COUNT" },
        { type: "Follow", id: userId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useLazyGetFollowersQuery,
  useLazyGetFollowingQuery,
  useGetFollowersCountQuery,
  useGetFollowingCountQuery,
} = followApi;
