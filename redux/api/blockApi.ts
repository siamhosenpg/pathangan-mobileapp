import { baseApi } from "./baseApi";

export interface BlockedUser {
  _id: string;
  name: string;
  username: string;
  profileImage?: string | null;
  greenmarkVerified?: boolean;
}

export interface BlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
}

export interface BlockUserArg {
  userId: string;
  // optimistic ভাবে blocked লিস্টে বসাতে লাগে
  user?: BlockedUser;
}

// block/unblock হলে এই সব cache আবার আনতে হবে (feed, comment, answer ইত্যাদি বদলে যায়)
const REFRESH_TAGS = [
  "Block",
  "Post",
  "User",
  "Follow",
  "Comment",
  "Answer",
  "Handout",
  "Chapter",
  "Reaction",
  "Notification",
] as const;

// backend /blocks এর আসল shape:
// { success, users: [{ blockId, user: {...}, blockedAt }], hasMore, nextCursor }
// তাই user থাকে item.user এর ভেতরে। পুরনো shape গুলোও সামলানো হয়েছে।
const normalizeUser = (item: any): BlockedUser | null => {
  const u =
    item?.user && typeof item.user === "object"
      ? item.user
      : item?.blocked && typeof item.blocked === "object"
        ? item.blocked
        : item;
  if (!u?._id) return null;
  return {
    _id: String(u._id),
    name: u.name ?? "",
    username: u.username ?? "",
    profileImage: u.profileImage ?? null,
    greenmarkVerified: !!u.greenmarkVerified,
  };
};

export const blockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== আমার blocked লিস্ট =====================
    getBlockedUsers: builder.query<BlockedUser[], void>({
      query: () => ({ url: "/blocks", method: "GET" }),
      transformResponse: (res: any): BlockedUser[] => {
        const raw = Array.isArray(res)
          ? res
          : (res?.users ??
            res?.blockedUsers ??
            res?.blocked ??
            res?.blocks ??
            res?.data ??
            []);
        return (raw as any[])
          .map(normalizeUser)
          .filter((u): u is BlockedUser => u !== null);
      },
      providesTags: ["Block"],
    }),

    // ===================== একজনের সাথে block সম্পর্ক =====================
    // backend /blocks/status/:userId এর আসল shape: { success, isBlockedByMe }
    // কেউ আমাকে block করেছে কিনা backend কখনো জানায় না, তাই blockedMe সবসময় false
    getBlockStatus: builder.query<BlockStatus, string>({
      query: (userId) => ({ url: `/blocks/status/${userId}`, method: "GET" }),
      transformResponse: (res: any): BlockStatus => {
        const s = res?.status ?? res;
        return {
          blockedByMe: !!(s?.isBlockedByMe ?? s?.blockedByMe),
          blockedMe: !!s?.blockedMe,
        };
      },
      providesTags: (_r, _e, userId) => [{ type: "Block", id: userId }],
    }),

    // ===================== Block (optimistic) =====================
    blockUser: builder.mutation<unknown, BlockUserArg>({
      query: ({ userId }) => ({ url: `/blocks/${userId}`, method: "POST" }),
      async onQueryStarted(
        { userId, user },
        { dispatch, queryFulfilled },
      ): Promise<void> {
        const statusPatch = dispatch(
          blockApi.util.updateQueryData("getBlockStatus", userId, (draft) => {
            draft.blockedByMe = true;
          }),
        );
        const listPatch = dispatch(
          blockApi.util.updateQueryData(
            "getBlockedUsers",
            undefined,
            (draft) => {
              if (user && !draft.some((u) => u._id === userId)) {
                draft.unshift(user);
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          // fail করলে আগের অবস্থায় ফেরত
          statusPatch.undo();
          listPatch.undo();
        }
      },
      invalidatesTags: [...REFRESH_TAGS],
    }),

    // ===================== Unblock (optimistic) =====================
    unblockUser: builder.mutation<unknown, string>({
      query: (userId) => ({ url: `/blocks/${userId}`, method: "DELETE" }),
      async onQueryStarted(
        userId,
        { dispatch, queryFulfilled },
      ): Promise<void> {
        const statusPatch = dispatch(
          blockApi.util.updateQueryData("getBlockStatus", userId, (draft) => {
            draft.blockedByMe = false;
          }),
        );
        const listPatch = dispatch(
          blockApi.util.updateQueryData(
            "getBlockedUsers",
            undefined,
            (draft) => {
              const i = draft.findIndex((u) => u._id === userId);
              if (i !== -1) draft.splice(i, 1);
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          statusPatch.undo();
          listPatch.undo();
        }
      },
      invalidatesTags: [...REFRESH_TAGS],
    }),
  }),
});

export const {
  useGetBlockedUsersQuery,
  useGetBlockStatusQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
} = blockApi;
