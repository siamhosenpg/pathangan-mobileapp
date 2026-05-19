import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const courses = [
  {
    id: "1",
    title: "React Native সম্পূর্ণ গাইড",
    instructor: "মাহমুদ হাসান",
    avatar: "ম",
    lessons: 24,
    enrolled: 342,
    tag: "প্রযুক্তি",
    color: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "2",
    title: "বাংলা সাহিত্যের ইতিহাস",
    instructor: "নাজমা বেগম",
    avatar: "ন",
    lessons: 18,
    enrolled: 215,
    tag: "সাহিত্য",
    color: "bg-purple-50",
    textColor: "text-purple-600",
  },
];

export default function CourseScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">কোর্স</Text>
          <Ionicons name="search-outline" size={24} color="#4F46E5" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-gray-500 mb-3">
          জনপ্রিয় কোর্স
        </Text>
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
          >
            <View className={`${course.color} rounded-xl p-3 mb-3`}>
              <View className="flex-row items-center justify-between">
                <View className={`px-3 py-1 rounded-full bg-white`}>
                  <Text className={`${course.textColor} text-xs font-semibold`}>
                    {course.tag}
                  </Text>
                </View>
                <Ionicons name="bookmark-outline" size={20} color="#9CA3AF" />
              </View>
            </View>
            <Text className="font-bold text-gray-800 text-base mb-2">
              {course.title}
            </Text>
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center">
                <Text className="text-gray-600 text-xs font-bold">
                  {course.avatar}
                </Text>
              </View>
              <Text className="text-gray-500 text-sm">{course.instructor}</Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="play-circle-outline"
                  size={16}
                  color="#9CA3AF"
                />
                <Text className="text-gray-400 text-xs">
                  {course.lessons}টি লেসন
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="people-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs">
                  {course.enrolled} জন
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
