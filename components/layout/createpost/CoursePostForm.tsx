import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import MediaPreviewGrid, { MediaItem } from "./MediaPreviewGrid";

interface Props {
  courseTitle: string;
  setCourseTitle: (v: string) => void;
  courseDesc: string;
  setCourseDesc: (v: string) => void;
  coursePrice: string;
  setCoursePrice: (v: string) => void;
  courseTags: string;
  setCourseTags: (v: string) => void;
  courseMedia: MediaItem[];
  onRemoveMedia: (i: number) => void;
  onPickMedia: () => void;
  isDark: boolean;
}

const CoursePostForm = ({
  courseTitle,
  setCourseTitle,
  courseDesc,
  setCourseDesc,
  coursePrice,
  setCoursePrice,
  courseTags,
  setCourseTags,
  courseMedia,
  onRemoveMedia,
  onPickMedia,
  isDark,
}: Props) => {
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";
  const bg = "bg-background-secondary dark:bg-dark-background-secondary";
  const border = "border border-border dark:border-dark-border";

  return (
    <View className="gap-4">
      {/* Title */}
      <View className="gap-2">
        <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
          কোর্সের শিরোনাম *
        </Text>
        <View className={`${border} ${bg} rounded-2xl px-4`}>
          <TextInput
            value={courseTitle}
            onChangeText={setCourseTitle}
            placeholder="কোর্সের নাম লিখুন"
            placeholderTextColor={ph}
            className="text-text dark:text-dark-text text-sm py-3.5"
          />
        </View>
      </View>

      {/* Description */}
      <View className="gap-2">
        <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
          বিবরণ
        </Text>
        <View className={`${border} ${bg} rounded-2xl px-4 py-3`}>
          <TextInput
            value={courseDesc}
            onChangeText={setCourseDesc}
            placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..."
            placeholderTextColor={ph}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="text-text dark:text-dark-text text-sm"
            style={{ minHeight: 90 }}
          />
        </View>
      </View>

      {/* Price + Tags row */}
      <View className="flex-row gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
            মূল্য (টাকা)
          </Text>
          <View
            className={`flex-row items-center ${border} ${bg} rounded-2xl px-4 gap-2`}
          >
            <Text className="text-accent font-bold text-sm">৳</Text>
            <TextInput
              value={coursePrice}
              onChangeText={setCoursePrice}
              placeholder="০"
              placeholderTextColor={ph}
              keyboardType="numeric"
              className="flex-1 text-text dark:text-dark-text text-sm py-3.5"
            />
          </View>
        </View>

        <View className="flex-1 gap-2">
          <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
            ট্যাগ
          </Text>
          <View className={`${border} ${bg} rounded-2xl px-4`}>
            <TextInput
              value={courseTags}
              onChangeText={setCourseTags}
              placeholder="react, design"
              placeholderTextColor={ph}
              className="text-text dark:text-dark-text text-sm py-3.5"
            />
          </View>
        </View>
      </View>

      {/* Media */}
      <MediaPreviewGrid media={courseMedia} onRemove={onRemoveMedia} />

      <TouchableOpacity
        onPress={onPickMedia}
        className={`flex-row items-center gap-3 px-4 py-3.5 rounded-2xl ${border} ${bg}`}
      >
        <View className="w-8 h-8 rounded-xl bg-accent/10 items-center justify-center">
          <Ionicons name="image-outline" size={18} color="#6366f1" />
        </View>
        <Text className="text-text-secondary dark:text-dark-text-secondary text-sm flex-1">
          কোর্স মিডিয়া যোগ করুন
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "#555" : "#bbb"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CoursePostForm;
