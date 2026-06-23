import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const contacts = [
    {
      icon: "mail-outline" as const,
      label: "ইমেইল সাপোর্ট",
      value: "support@pathangan.com",
      onPress: () => Linking.openURL("mailto:support@pathangan.com"),
    },
    {
      icon: "globe-outline" as const,
      label: "ওয়েবসাইট",
      value: "www.pathangan.com",
      onPress: () => Linking.openURL("https://www.pathangan.com"),
    },
  ];

  const faqs = [
    {
      q: "পাসওয়ার্ড ভুলে গেলে কী করব?",
      a: "লগইন পেজে 'ভুলে গেছেন?' বাটনে চাপুন এবং ইমেইলের মাধ্যমে রিসেট করুন।",
    },
    {
      q: "অ্যাকাউন্ট কীভাবে মুছব?",
      a: "Settings → Account → Delete Account থেকে অ্যাকাউন্ট স্থায়ীভাবে মুছে দিতে পারবেন।",
    },
    {
      q: "কোনো সমস্যা রিপোর্ট করব কীভাবে?",
      a: "support@pathangan.com-এ ইমেইল করুন অথবা অ্যাপের ভেতর থেকে রিপোর্ট করুন।",
    },
    {
      q: "নোটিফিকেশন বন্ধ করব কীভাবে?",
      a: "Settings → Notifications থেকে পছন্দমতো নোটিফিকেশন নিয়ন্ত্রণ করুন।",
    },
  ];

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
          সাপোর্ট ও যোগাযোগ
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact cards */}
        <Text className="text-sm font-semibold text-text dark:text-dark-text mb-3">
          যোগাযোগ করুন
        </Text>
        <View className="gap-3 mb-8">
          {contacts.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-4"
            >
              <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
                <Ionicons name={item.icon} size={20} color="#00914d" />
              </View>
              <View className="flex-1">
                <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                  {item.label}
                </Text>
                <Text className="text-text dark:text-dark-text text-sm font-medium mt-0.5">
                  {item.value}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? "#8a8a8a" : "#6d6d6d"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text className="text-sm font-semibold text-text dark:text-dark-text mb-3">
          সাধারণ প্রশ্নোত্তর
        </Text>
        <View className="gap-3">
          {faqs.map((item, index) => (
            <View
              key={index}
              className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-4"
            >
              <Text className="text-sm font-semibold text-text dark:text-dark-text mb-1.5">
                {item.q}
              </Text>
              <Text className="text-sm text-text-secondary dark:text-dark-text-secondary leading-5">
                {item.a}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
