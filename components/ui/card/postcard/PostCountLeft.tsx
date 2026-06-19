import { useNumber } from "@/hooks/useNumber";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface Props {
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  viewsCount?: number; // ← add
}

const PostCountLeft = ({
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  viewsCount = 0, // ← add
}: Props) => {
  const { t } = useTranslation();
  const n = useNumber();
  return (
    <View className="flex-row items-center w-full  justify-between gap-3">
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold  text-text-tertiary dark:text-dark-text-tertiary">
            {t("countLove", { count: n(likesCount) })}
          </Text>
        </View>

        {commentsCount > 0 && (
          <View className="flex-row items-center gap-1">
            <Text className="font-semibold text-sm text-text-tertiary dark:text-dark-text-tertiary">
              {t("countComments", { count: n(commentsCount) })}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-1">
          <Text className="font-semibold text-sm text-text-tertiary dark:text-dark-text-tertiary">
            {t("countShare", { count: n(sharesCount) })}
          </Text>
        </View>
      </View>
      {/* ← views add */}
      {viewsCount > 0 && (
        <View className="flex-row  items-center gap-1">
          <Text className="font-semibold text-sm text-text-tertiary dark:text-dark-text-tertiary">
            {t("countViews", { count: n(viewsCount) })}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PostCountLeft;
