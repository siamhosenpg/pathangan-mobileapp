import FeedList, {
  type FeedRefreshResult,
} from "@/components/ui/feed/FeedList";
import { SavedCollectionContext } from "@/contexts/SavedCollectionContext";
import { useGetSavedItemsInfiniteQuery } from "@/redux/api/save/savedItemApi";
import type { Post } from "@/types/postTypes";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  collectionId: string;
  // FeedList যে scrollY পাঠায় সেটা parent-এ পৌঁছে দেয় (header লুকানোর জন্য)
  onScroll?: (scrollY: number) => void;
  // উপরের ভাসমান header-এর উচ্চতা
  topInset?: number;
}

export function SavedPostsList({
  collectionId,
  onScroll,
  topInset = 0,
}: Props) {
  const { t } = useTranslation();

  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetSavedItemsInfiniteQuery(collectionId, { skip: !collectionId });

  // ভেতরের বুকমার্ক বাটন যেন জানে এখন কোন কালেকশন খোলা
  const contextValue = useMemo(() => ({ collectionId }), [collectionId]);

  // saved item থেকে post বের করা (ডিলিট হওয়া post বাদ, একই post দুবার এলে একবার)
  const posts = useMemo(() => {
    const seen = new Set<string>();
    const list: Post[] = [];

    for (const page of data?.pages ?? []) {
      for (const item of page.items) {
        const post = item?.postId as Post | null | undefined;
        if (!post || seen.has(post._id)) continue;
        seen.add(post._id);
        list.push(post);
      }
    }

    return list;
  }, [data]);

  const postsLengthRef = useRef(posts.length);
  postsLengthRef.current = posts.length;

  // কোনো পোস্ট ডিলিট হয়ে গেলে একটা পেজ পুরো খালি আসতে পারে,
  // তখন scroll event আসবে না — তাই নিজে থেকেই পরের পেজ আনি
  // (next page-এ error থাকলে লুপ আটকাতে থামবে)
  useEffect(() => {
    if (isLoading || isFetching || isFetchNextPageError) return;
    if (posts.length === 0 && hasNextPage) fetchNextPage();
  }, [
    isLoading,
    isFetching,
    isFetchNextPageError,
    posts.length,
    hasNextPage,
    fetchNextPage,
  ]);

  // pull-to-refresh (নেট চেক, loader আর error alert FeedList নিজেই সামলায়)
  const refresh = useCallback(async (): Promise<FeedRefreshResult> => {
    try {
      const result = await refetch();

      // refresh fail হলেও পুরনো পোস্ট থাকবে, শুধু user কে জানানো হবে
      if (result?.isError && postsLengthRef.current > 0) {
        return { failed: true, error: result.error };
      }
    } catch (err) {
      if (postsLengthRef.current > 0) return { failed: true, error: err };
    }

    return { failed: false };
  }, [refetch]);

  // পোস্ট নেই কিন্তু পরের পেজ আছে — এটাও আসলে "লোডিং"
  const showLoading =
    isLoading || (posts.length === 0 && hasNextPage && !isFetchNextPageError);

  return (
    <SavedCollectionContext.Provider value={contextValue}>
      <FeedList
        posts={posts}
        isLoading={showLoading}
        isError={isError}
        error={error}
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        onRetry={refetch}
        refresh={refresh}
        emptyText={t("saveData.emptyCollection")}
        showUploadProgress={false}
        keepListOnEmpty
        onScroll={onScroll}
        topInset={topInset}
        bottomInset={topInset} // bottom inset না দিলে list-এর শেষের কিছু পোস্ট tab bar-এর নিচে ঢেকে যাবে
      />
    </SavedCollectionContext.Provider>
  );
}
