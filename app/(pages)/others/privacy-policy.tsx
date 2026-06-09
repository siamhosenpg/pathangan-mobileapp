import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {/* Header */}
      <View className="px-4 pt-16 pb-3 border-b border-border dark:border-dark-border flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#c4c4c4" : "#3a3a3a"}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text dark:text-dark-text">
          গোপনীয়তা নীতি
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
            title: "ভূমিকা",
            body: `পাঠাঙ্গন ("আমরা", "আমাদের") আপনার গোপনীয়তাকে সম্মান করে। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি।`,
          },
          {
            title: "আমরা কী তথ্য সংগ্রহ করি",
            body: `• নাম, ইমেইল এবং পাসওয়ার্ড (রেজিস্ট্রেশনের সময়)\n• প্রোফাইল ছবি এবং কভার ছবি\n• বায়ো, অবস্থান, শিক্ষা ও কর্মজীবন তথ্য\n• পোস্ট, মন্তব্য এবং প্রশ্নের কন্টেন্ট\n• ডিভাইস তথ্য এবং লগ ডেটা`,
          },
          {
            title: "তথ্য ব্যবহারের উদ্দেশ্য",
            body: `• অ্যাকাউন্ট পরিচালনা এবং পরিষেবা প্রদান\n• ব্যক্তিগতকৃত অভিজ্ঞতা তৈরি করা\n• নিরাপত্তা নিশ্চিত করা এবং জালিয়াতি প্রতিরোধ\n• অ্যাপ উন্নতির জন্য বিশ্লেষণ`,
          },
          {
            title: "তথ্য শেয়ারিং",
            body: `আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দিই না। তবে নিম্নলিখিত ক্ষেত্রে শেয়ার করা হতে পারে:\n\n• আইনি বাধ্যবাধকতা পূরণের জন্য\n• Cloudinary (মিডিয়া স্টোরেজ)\n• MongoDB Atlas (ডেটাবেস সেবা)`,
          },
          {
            title: "তথ্য সুরক্ষা",
            body: `আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি, যার মধ্যে রয়েছে এনক্রিপশন, নিরাপদ সংযোগ (HTTPS) এবং নিয়মিত নিরাপত্তা পর্যালোচনা।`,
          },
          {
            title: "আপনার অধিকার",
            body: `আপনি যেকোনো সময়:\n• আপনার তথ্য দেখতে ও আপডেট করতে পারবেন\n• আপনার অ্যাকাউন্ট মুছে দিতে পারবেন\n• তথ্য প্রক্রিয়াকরণে আপত্তি জানাতে পারবেন`,
          },
          {
            title: "শিশুদের গোপনীয়তা",
            body: `পাঠাঙ্গন ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা জেনেশুনে শিশুদের তথ্য সংগ্রহ করি না।`,
          },
          {
            title: "নীতি পরিবর্তন",
            body: `আমরা এই নীতি পরিবর্তন করলে অ্যাপের মাধ্যমে আপনাকে জানানো হবে। পরিবর্তনের পরেও অ্যাপ ব্যবহার অব্যাহত রাখলে আপনি নতুন নীতিতে সম্মত বলে ধরা হবে।`,
          },
          {
            title: "যোগাযোগ",
            body: `গোপনীয়তা সম্পর্কিত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:\nসাপোর্ট: support@pathangan.com`,
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
    </View>
  );
}
