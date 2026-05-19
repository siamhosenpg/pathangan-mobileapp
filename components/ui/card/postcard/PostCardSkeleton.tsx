import { View } from "react-native";

const PostCardSkeleton = () => {
  return (
    <View className="bg-background pt-6  pb-6">
      {/* top profile section */}
      <View className="px-6 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* profile image */}
          <View className="w-12 h-12 rounded-full bg-background-secondary" />
          {/* name + time */}
          <View className="gap-2">
            <View className="h-4 w-36 rounded bg-background-secondary" />
            <View className="h-3 w-20 rounded bg-background-secondary" />
          </View>
        </View>
        {/* three dot */}
        <View className="h-8 w-8 rounded-full bg-background-secondary" />
      </View>

      {/* title */}
      <View className="px-6 mt-2">
        <View className="h-5 w-2/3 rounded bg-background-secondary" />
      </View>

      {/* text */}
      <View className="px-6 mt-4 gap-2">
        <View className="h-4 w-full rounded bg-background-secondary" />
        <View className="h-4 w-full rounded bg-background-secondary" />
        <View className="h-4 w-3/4 rounded bg-background-secondary" />
      </View>

      {/* image */}
      <View className="mt-5 px-6">
        <View className="w-full h-48 bg-background-secondary rounded-xl" />
      </View>
    </View>
  );
};

export default PostCardSkeleton;
