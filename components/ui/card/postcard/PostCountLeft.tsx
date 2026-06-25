import { useNumber } from "@/hooks/useNumber";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface Props {
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  viewsCount?: number;
  classStyle?: String;
}

const PostCountLeft = ({
  classStyle,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  viewsCount = 0,
}: Props) => {
  const { t } = useTranslation();
  const n = useNumber();
  return (
    <View
      className={`flex-row items-center  justify-between gap-3 ${classStyle ? classStyle : "w-full "}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-medium  text-text-tertiary dark:text-dark-text-tertiary">
            {t("countLove", { count: n(likesCount) })}
          </Text>
        </View>

        {commentsCount > 0 && (
          <View className="flex-row items-center gap-1">
            <Text className="font-medium text-xs text-text-tertiary dark:text-dark-text-tertiary">
              {t("countComments", { count: n(commentsCount) })}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-1">
          <Text className="font-medium text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {t("countShare", { count: n(sharesCount) })}
          </Text>
        </View>
      </View>
      {/* ← views add */}
      {viewsCount > 0 && (
        <View className="flex-row  items-center gap-1">
          <Text className="font-medium text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {t("countViews", { count: n(viewsCount) })}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PostCountLeft;
