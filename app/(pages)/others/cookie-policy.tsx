import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CookiePolicyScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <View className="px-4 pt-16 pb-3 border-b border-border dark:border-dark-border flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#c4c4c4" : "#3a3a3a"}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text dark:text-dark-text">
          কুকি নীতি
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs mb-6">
          সর্বশেষ আপডেট: জুন ২০২৫
        </Text>

        {[
          {
            title: "কুকি কী",
            body: `কুকি হলো ছোট টেক্সট ফাইল যা আপনার ডিভাইসে সংরক্ষিত হয়। মোবাইল অ্যাপে আমরা কুকির পরিবর্তে AsyncStorage এবং Secure Token ব্যবহার করি।`,
          },
          {
            title: "আমরা কী সংরক্ষণ করি",
            body: `• অ্যাথেনটিকেশন টোকেন (লগইন সেশন)\n• ভাষা পছন্দ (বাংলা/ইংরেজি)\n• থিম পছন্দ (ডার্ক/লাইট মোড)\n• নোটিফিকেশন সেটিংস`,
          },
          {
            title: "তৃতীয় পক্ষের সেবা",
            body: `আমরা নিম্নলিখিত তৃতীয় পক্ষের সেবা ব্যবহার করি যারা নিজস্ব ডেটা সংগ্রহ করতে পারে:\n\n• Cloudinary — ছবি ও মিডিয়া স্টোরেজ\n• MongoDB Atlas — ডেটাবেস\n• Render — সার্ভার হোস্টিং`,
          },
          {
            title: "নিয়ন্ত্রণ",
            body: `আপনি অ্যাপের Settings থেকে সংরক্ষিত ডেটা মুছে দিতে পারবেন। অ্যাকাউন্ট মুছে দিলে সমস্ত সংরক্ষিত ডেটা স্থায়ীভাবে মুছে যাবে।`,
          },
          {
            title: "যোগাযোগ",
            body: `কুকি নীতি সম্পর্কে প্রশ্নের জন্য:\nsupport@pathangan.com`,
          },
        ].map((section, index) => (
          <View key={index} className="mb-6">
            <Text className="text-base font-bold text-text dark:text-dark-text mb-2">
              {index + 1}. {section.title}
            </Text>
            <Text className="text-sm text-text-secondary dark:text-dark-text-secondary leading-6">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
