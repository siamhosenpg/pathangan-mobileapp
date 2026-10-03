import { baseApi } from "../baseApi";

import {
  GetNotificationsResponse,
  NotificationActionResponse,
  UnreadCountResponse,
} from "./../../../types/notification/notificationTypes";

// ===================== OPTIMISTIC HELPERS =====================
// notificationApi nijer bhitore nijeke reference korle TS circular error dey,
// tai baseApi.util use kora hoyeche
const util = baseApi.util as any;

type Patch = { undo: () => void };
type Pages = GetNotificationsResponse[];

// cache-e joto gulo getMyNotifications entry ache (limit bhede), shobgulor arg
const getCachedArgs = (getState: () => unknown): { limit?: number }[] =>
  util.selectCachedArgsForQuery(getState(), "getMyNotifications") ?? [];

// shob cached list-e ekshathe change boshay
const patchLists = (
  dispatch: any,
  getState: () => unknown,
  recipe: (pages: Pages) => void,
): Patch[] =>
  getCachedArgs(getState).map((arg) =>
    dispatch(
      util.updateQueryData("getMyNotifications", arg, (draft: any) => {
        if (draft?.pages) recipe(draft.pages);
      }),
    ),
  );

// unread count badge patch
const patchCount = (
  dispatch: any,
  recipe: (current: number) => number,
): Patch =>
  dispatch(
    util.updateQueryData(
      "getUnreadNotificationCount",
      undefined,
      (draft: any) => {
        draft.count = recipe(draft.count ?? 0);
      },
    ),
  );

// cache theke ekta notification khuje ber kore (age unread chhilo kina jante)
const findInCache = (getState: () => unknown, id: string) => {
  for (const arg of getCachedArgs(getState)) {
    const sel = (baseApi.endpoints as any).getMyNotifications.select(arg);
    const pages: Pages | undefined = sel(getState() as any)?.data?.pages;
    for (const page of pages ?? []) {
      const found = page.notifications.find((n: any) => n._id === id);
      if (found) return found;
    }
  }
  return undefined;
};

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== GET NOTIFICATIONS (INFINITE) =====================
    getMyNotifications: builder.infiniteQuery<
      GetNotificationsResponse,
      { limit?: number },
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage: GetNotificationsResponse) =>
          lastPage.nextCursor ?? null,
      },
      query: ({
        queryArg,
        pageParam,
      }: {
        queryArg: { limit?: number };
        pageParam: string | null;
      }) => ({
        url: "/notifications",
        method: "GET" as const,
        params: {
          cursor: pageParam ?? undefined,
          limit: queryArg.limit ?? 10,
        },
      }),
      providesTags: ["Notification"],
    }),

    // ===================== UNREAD COUNT =====================
    getUnreadNotificationCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET" as const,
      }),
      providesTags: ["Notification"],
    }),

    // ===================== MARK SINGLE AS READ (optimistic) =====================
    markAsRead: builder.mutation<NotificationActionResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH" as const,
      }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const wasUnread = findInCache(getState, id)?.read === false;

        const patches = patchLists(dispatch, getState, (pages) => {
          for (const page of pages) {
            for (const n of page.notifications) {
              if (n._id === id) n.read = true;
            }
          }
        });

        if (wasUnread) {
          patches.push(patchCount(dispatch, (c) => Math.max(0, c - 1)));
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    // ===================== MARK ALL AS READ (optimistic) =====================
    markAllAsRead: builder.mutation<NotificationActionResponse, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH" as const,
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        const patches = patchLists(dispatch, getState, (pages) => {
          for (const page of pages) {
            for (const n of page.notifications) n.read = true;
          }
        });
        patches.push(patchCount(dispatch, () => 0));

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    // ===================== DELETE SINGLE (optimistic) =====================
    deleteNotification: builder.mutation<NotificationActionResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE" as const,
      }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const wasUnread = findInCache(getState, id)?.read === false;

        const patches = patchLists(dispatch, getState, (pages) => {
          for (const page of pages) {
            page.notifications = page.notifications.filter(
              (n: any) => n._id !== id,
            );
          }
        });

        if (wasUnread) {
          patches.push(patchCount(dispatch, (c) => Math.max(0, c - 1)));
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    // ===================== DELETE ALL (optimistic) =====================
    deleteAllNotifications: builder.mutation<NotificationActionResponse, void>({
      query: () => ({
        url: "/notifications/delete-all",
        method: "DELETE" as const,
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        const patches = patchLists(dispatch, getState, (pages) => {
          for (const page of pages) {
            page.notifications = [];
            page.nextCursor = null;
          }
        });
        patches.push(patchCount(dispatch, () => 0));

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export const {
  useGetMyNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = notificationApi;
