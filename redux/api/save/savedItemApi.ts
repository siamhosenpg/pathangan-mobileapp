import type { Post } from "@/types/postTypes";
import { baseApi } from "../baseApi";

export const SAVED_PAGE_LIMIT = 10;

export interface SavedItem {
  _id: string;
  postId: Post;
  collectionId: string;
  userId: string;
  createdAt: string;
}

export interface SavedItemsPage {
  items: SavedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CheckIfSavedResult {
  saved: boolean;
  // পোস্টটা যে যে কালেকশনে সেভ আছে তাদের id
  collectionIds: string[];
}

interface SaveItemArgs {
  collectionId: string;
  postId: string;
  // true হলে সেভড পেজের লিস্ট নিজে থেকে রিফেচ হবে না,
  // তাই আনসেভ করা পোস্ট লিস্টে থেকে যাবে (রিফ্রেশ করলে সরবে)
  keepInList?: boolean;
}

const savedItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkIfSaved: builder.query<CheckIfSavedResult, string>({
      query: (postId) => ({
        url: `/items/check/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "SavedItem", id: `CHECK-${postId}` },
      ],
    }),

    // কালেকশনের আইটেম — infinite scroll
    getSavedItems: builder.infiniteQuery<SavedItemsPage, string, string>({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) =>
          lastPage.hasMore && lastPage.nextCursor
            ? lastPage.nextCursor
            : undefined,
      },
      query: ({ queryArg: collectionId, pageParam }) => ({
        url: `/items/item/${collectionId}`,
        method: "GET",
        params: {
          limit: SAVED_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
      }),
      providesTags: (result, error, collectionId) => [
        { type: "SavedItem", id: `LIST-${collectionId}` },
      ],
    }),

    savePost: builder.mutation<SavedItem, SaveItemArgs>({
      query: ({ collectionId, postId }) => ({
        url: `/items/item/${collectionId}`,
        method: "POST",
        body: { postId },
      }),
      async onQueryStarted(
        { collectionId, postId },
        { dispatch, queryFulfilled },
      ) {
        // সাথে সাথে বুকমার্ক আইকনে সেভ দেখাও
        const patch = dispatch(
          savedItemApi.util.updateQueryData("checkIfSaved", postId, (draft) => {
            if (!draft.collectionIds.includes(collectionId)) {
              draft.collectionIds.push(collectionId);
            }
            draft.saved = true;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (
        result,
        error,
        { collectionId, postId, keepInList },
      ) => [
        "Collection",
        { type: "SavedItem", id: `CHECK-${postId}` },
        // সেভড পেজ থেকে হলে লিস্ট রিফেচ করা হবে না
        ...(keepInList
          ? []
          : [{ type: "SavedItem" as const, id: `LIST-${collectionId}` }]),
      ],
    }),

    deleteSavedItem: builder.mutation<{ message: string }, SaveItemArgs>({
      query: ({ collectionId, postId }) => ({
        url: `/items/item/${collectionId}/${postId}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { collectionId, postId },
        { dispatch, queryFulfilled },
      ) {
        // শুধু বুকমার্ক আইকনের অবস্থা বদলায়, লিস্ট থেকে পোস্ট সরানো হয় না
        const patch = dispatch(
          savedItemApi.util.updateQueryData("checkIfSaved", postId, (draft) => {
            draft.collectionIds = draft.collectionIds.filter(
              (id) => id !== collectionId,
            );
            draft.saved = draft.collectionIds.length > 0;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (
        result,
        error,
        { collectionId, postId, keepInList },
      ) => [
        "Collection",
        { type: "SavedItem", id: `CHECK-${postId}` },
        // সেভড পেজ থেকে হলে লিস্ট রিফেচ করা হবে না, তাই পোস্ট লিস্টে থেকে যাবে
        ...(keepInList
          ? []
          : [{ type: "SavedItem" as const, id: `LIST-${collectionId}` }]),
      ],
    }),
  }),
});

export const {
  useCheckIfSavedQuery,
  useGetSavedItemsInfiniteQuery,
  useSavePostMutation,
  useDeleteSavedItemMutation,
} = savedItemApi;
