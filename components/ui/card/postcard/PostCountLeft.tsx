import { Text, View } from "react-native";
import BanglaNumber from "../../extra/BanglaNumber";

interface Props {
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

const PostCountLeft = ({
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
}: Props) => {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-row items-center gap-1">
        <Text className="font-semibold text-sm text-text-tertiary dark:text-dark-text-tertiary">
          <BanglaNumber value={likesCount} />
        </Text>
        <Text className="text-sm font-medium  text-text-tertiary dark:text-dark-text-tertiary">
          সমর্থন
        </Text>
      </View>

      {commentsCount > 0 && (
        <View className="flex-row items-center gap-1">
          <Text className="font-semibold text-sm text-text-tertiary dark:text-dark-text-tertiary">
            <BanglaNumber value={commentsCount} />
          </Text>
          <Text className="text-sm font-medium  text-text-tertiary dark:text-dark-text-tertiary">
            মতামত
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-1">
        <Text className="font-semibold text-sm text-text-tertiary dark:text-dark-text-tertiary">
          <BanglaNumber value={sharesCount} />
        </Text>
        <Text className="text-sm font-medium  text-text-tertiary dark:text-dark-text-tertiary">
          প্রচার
        </Text>
      </View>
    </View>
  );
};

export default PostCountLeft;
