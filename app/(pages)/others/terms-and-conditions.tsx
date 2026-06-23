import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
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
          ব্যবহারের শর্তাবলী
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
            title: "সেবা গ্রহণের শর্ত",
            body: `পাঠাঙ্গন ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। আপনার বয়স কমপক্ষে ১৩ বছর হতে হবে। আপনি যদি এই শর্তে সম্মত না হন, অনুগ্রহ করে অ্যাপ ব্যবহার বন্ধ করুন।`,
          },
          {
            title: "অ্যাকাউন্ট দায়িত্ব",
            body: `• আপনার অ্যাকাউন্টের নিরাপত্তা আপনার দায়িত্ব\n• সঠিক এবং আপডেট তথ্য প্রদান করতে হবে\n• অ্যাকাউন্ট অন্য কারো সাথে শেয়ার করা যাবে না\n• সন্দেহজনক কার্যক্রম দেখলে আমাদের জানান`,
          },
          {
            title: "গ্রহণযোগ্য ব্যবহার",
            body: `পাঠাঙ্গনে আপনি পারবেন:\n• শিক্ষামূলক কন্টেন্ট শেয়ার করতে\n• প্রশ্ন করতে এবং উত্তর দিতে\n• অন্যদের অনুসরণ করতে এবং মতামত দিতে\n• কোর্স তৈরি ও অংশগ্রহণ করতে`,
          },
          {
            title: "নিষিদ্ধ কার্যক্রম",
            body: `নিম্নলিখিত কার্যক্রম সম্পূর্ণ নিষিদ্ধ:\n• মিথ্যা বা বিভ্রান্তিকর তথ্য প্রচার\n• হয়রানি, ঘৃণামূলক বক্তব্য বা সহিংসতা\n• কপিরাইট লঙ্ঘন\n• স্প্যাম বা স্বয়ংক্রিয় বট ব্যবহার\n• অন্যের অ্যাকাউন্টে অননুমোদিত প্রবেশ`,
          },
          {
            title: "কন্টেন্টের মালিকানা",
            body: `আপনি যে কন্টেন্ট পোস্ট করেন তার মালিকানা আপনার। তবে পোস্ট করে আপনি পাঠাঙ্গনকে সেই কন্টেন্ট প্রদর্শন ও বিতরণের অ-একচেটিয়া লাইসেন্স দিচ্ছেন।`,
          },
          {
            title: "পরিষেবা পরিবর্তন",
            body: `আমরা যেকোনো সময় পরিষেবার যেকোনো অংশ পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার রাখি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আপনাকে আগেই জানানো হবে।`,
          },
          {
            title: "অ্যাকাউন্ট বাতিল",
            body: `শর্ত লঙ্ঘনের ক্ষেত্রে আমরা সতর্কতা ছাড়াই অ্যাকাউন্ট স্থগিত বা মুছে দেওয়ার অধিকার রাখি। আপনিও যেকোনো সময় আপনার অ্যাকাউন্ট বন্ধ করতে পারবেন।`,
          },
          {
            title: "দায় সীমাবদ্ধতা",
            body: `পাঠাঙ্গন কোনো ব্যবহারকারীর কন্টেন্টের জন্য দায়ী নয়। আমরা সর্বোচ্চ চেষ্টা করি, কিন্তু পরিষেবার নিরবচ্ছিন্নতার কোনো নিশ্চয়তা দিতে পারি না।`,
          },
          {
            title: "প্রযোজ্য আইন",
            body: `এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত হবে।`,
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
