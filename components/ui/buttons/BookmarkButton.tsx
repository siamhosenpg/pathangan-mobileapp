import { useIconColor } from "@/hooks/useIconColor";
import { useGetDefaultCollectionQuery } from "@/redux/api/save/savedCollectionApi";
import {
  useCheckIfSavedQuery,
  useDeleteSavedItemMutation,
  useSavePostMutation,
} from "@/redux/api/save/savedItemApi";
import { Ionicons } from "@expo/vector-icons";

import { TouchableOpacity } from "react-native";

export default function BookmarkButton({ postId }: { postId: string }) {
  const { data: savedStatus } = useCheckIfSavedQuery(postId, {
    skip: !postId,
  });
  const { data: defaultCol, isLoading: colLoading } =
    useGetDefaultCollectionQuery();

  const colors = useIconColor();

  const iconColor = savedStatus?.saved ? colors.accent : colors.primary;
  const [savePost, { isLoading: saving }] = useSavePostMutation();
  const [deleteSaved, { isLoading: deleting }] = useDeleteSavedItemMutation();

  const isLoading = saving || deleting || colLoading;

  const handleToggle = async () => {
    if (!postId || !defaultCol?._id || isLoading) return;
    if (savedStatus?.saved) {
      await deleteSaved(postId);
    } else {
      await savePost({ collectionId: defaultCol._id, postId });
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading || !postId}
      style={{ opacity: isLoading ? 0.5 : 1 }}
    >
      <Ionicons
        name={savedStatus?.saved ? "bookmark" : "bookmark-outline"}
        size={22}
        color={iconColor}
      />
    </TouchableOpacity>
  );
}
