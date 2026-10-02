import type { Handout } from "@/types/handoutTypes";
import type { Post } from "@/types/postTypes";
import { baseApi } from "../baseApi";

export interface SearchUser {
  _id: string;
  name: string;
  username: string;
  userid: number;
  profileImage?: string;
  greenmarkVerified?: boolean;
}

// "সব" tab-এর preview
export interface SearchPreviewResult {
  success: boolean;
  users: SearchUser[];
  posts: Post[];
  handouts: Handout[];
  hasMore: {
    users: boolean;
    posts: boolean;
    handouts: boolean;
  };
}

// আলাদা tab-এর এক page
export interface SearchPage<T> {
  success: boolean;
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SearchArgs {
  q: string;
  limit?: number;
}

type PageParam = string | null;

const PAGE_LIMIT = 15;

const infiniteOptions = {
  initialPageParam: null as PageParam,
  getNextPageParam: (lastPage: SearchPage<unknown>) =>
    lastPage.nextCursor ?? null,
};

const buildQuery =
  (type: "users" | "posts" | "handouts") =>
  ({
    queryArg,
    pageParam,
  }: {
    queryArg: SearchArgs;
    pageParam: PageParam;
  }) => ({
    url: "/search/search",
    method: "GET" as const,
    params: {
      q: queryArg.q,
      type,
      limit: queryArg.limit ?? PAGE_LIMIT,
      cursor: pageParam ?? undefined,
    },
  });

const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // "সব" tab: প্রতিটার ৩টা করে
    globalSearch: builder.query<SearchPreviewResult, { q: string }>({
      query: ({ q }) => ({
        url: "/search/search",
        method: "GET" as const,
        params: { q, type: "all" },
      }),
    }),

    searchUsers: builder.infiniteQuery<
      SearchPage<SearchUser>,
      SearchArgs,
      PageParam
    >({
      infiniteQueryOptions: infiniteOptions,
      query: buildQuery("users"),
    }),

    searchPosts: builder.infiniteQuery<SearchPage<Post>, SearchArgs, PageParam>(
      {
        infiniteQueryOptions: infiniteOptions,
        query: buildQuery("posts"),
      },
    ),

    searchHandouts: builder.infiniteQuery<
      SearchPage<Handout>,
      SearchArgs,
      PageParam
    >({
      infiniteQueryOptions: infiniteOptions,
      query: buildQuery("handouts"),
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useSearchUsersInfiniteQuery,
  useSearchPostsInfiniteQuery,
  useSearchHandoutsInfiniteQuery,
} = searchApi;
