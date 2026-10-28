import Bookmark from "@/assets/icons/bookmark.svg";
import BookmarkBold from "@/assets/icons/bookmarkBold.svg";
import { useBottomSheet } from "@/components/ui/bottom-sheet/useBottomSheet";
import SaveBottomSheet from "@/components/ui/save/SaveBottomSheet";
import { useSavedCollection } from "@/contexts/SavedCollectionContext";
import { useIconColor } from "@/hooks/useIconColor";
import { useGetDefaultCollectionQuery } from "@/redux/api/save/savedCollectionApi";
import {
  useCheckIfSavedQuery,
  useDeleteSavedItemMutation,
  useSavePostMutation,
} from "@/redux/api/save/savedItemApi";

import { TouchableOpacity } from "react-native";

export default function BookmarkButton({ postId }: { postId: string }) {
  const { open } = useBottomSheet();

  // সেভড পেজে কোনো কালেকশন খোলা থাকলে তার id, নাহলে null
  const { collectionId: openedCollectionId } = useSavedCollection();

  const { data: savedStatus } = useCheckIfSavedQuery(postId, {
    skip: !postId,
  });
  const { data: defaultCol, isLoading: colLoading } =
    useGetDefaultCollectionQuery();

  const colors = useIconColor();

  const [savePost, { isLoading: saving }] = useSavePostMutation();
  const [deleteSaved, { isLoading: deleting }] = useDeleteSavedItemMutation();

  // সেভড পেজে খোলা কালেকশনটাই টার্গেট, নাহলে ডিফল্ট কালেকশন
  const targetCollectionId = openedCollectionId ?? defaultCol?._id ?? null;

  // ডিফল্ট কালেকশনের লোডিং শুধু তখনই দরকার যখন খোলা কালেকশন নেই
  const isLoading = saving || deleting || (!openedCollectionId && colLoading);

  const isSavedInTarget =
    !!targetCollectionId &&
    !!savedStatus?.collectionIds?.includes(targetCollectionId);

  // সেভড পেজে: খোলা কালেকশনে আছে কিনা দেখে আইকন
  // অন্য জায়গায়: যেকোনো কালেকশনে সেভ থাকলেই আইকন ভরাট
  const isSaved = openedCollectionId ? isSavedInTarget : !!savedStatus?.saved;

  const iconColor = isSaved ? colors.accent : colors.primary;

  // সেভড পেজে থাকলে লিস্ট রিফেচ হবে না, তাই আনসেভ করা পোস্ট লিস্টে থেকে যাবে
  const keepInList = !!openedCollectionId;

  // এক ট্যাপ: টার্গেট কালেকশনে সেভ / সেখান থেকে সরানো
  const handleToggle = async () => {
    if (!postId || !targetCollectionId || isLoading) return;

    if (isSavedInTarget) {
      await deleteSaved({
        collectionId: targetCollectionId,
        postId,
        keepInList,
      });
    } else {
      await savePost({
        collectionId: targetCollectionId,
        postId,
        keepInList,
      });
    }
  };

  // চেপে ধরলে: সব কালেকশন দেখানো বটম শিট
  const handleLongPress = () => {
    if (!postId) return;
    open(<SaveBottomSheet postId={postId} />);
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      onLongPress={handleLongPress}
      delayLongPress={350}
      hitSlop={8}
      disabled={isLoading || !postId}
      style={{ opacity: isLoading ? 0.5 : 1 }}
    >
      {isSaved ? (
        <BookmarkBold width={16} height={16} color={iconColor} />
      ) : (
        <Bookmark width={16} height={16} color={iconColor} />
      )}
    </TouchableOpacity>
  );
}
