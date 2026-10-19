import PeopleTab from "@/components/layout/private-questions/PeopleTab";
import PrivateQuestionHeader from "@/components/ui/headers/PrivateQuestionHeader";
import type {
  PrivateQuestionPerson,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Animated, Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Index = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<QuestionMode>("inbox");
  const [sentMounted, setSentMounted] = useState(false);
  const translateX = useState(new Animated.Value(0))[0];

  const switchTab = (tab: QuestionMode) => {
    setActiveTab(tab);
    if (tab === "sent") setSentMounted(true);

    Animated.timing(translateX, {
      toValue: tab === "inbox" ? 0 : -width,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  // ইউজারের উপর ট্যাপ → ওই ইউজারের সাথে প্রশ্নগুলোর পেজ
  const handlePressPerson = (
    person: PrivateQuestionPerson,
    mode: QuestionMode,
  ) => {
    router.push(`/private-questions/user/${person.userId}?mode=${mode}`);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <PrivateQuestionHeader
        activeTab={activeTab}
        onTabChange={switchTab}
        onBack={handleBack}
      />

      <Animated.View
        style={{
          flex: 1,
          flexDirection: "row",
          width: width * 2,
          transform: [{ translateX }],
        }}
      >
        {/* INBOX — যারা আমাকে প্রশ্ন করেছে */}
        <View style={{ width }}>
          <PeopleTab
            mode="inbox"
            onPress={(p) => handlePressPerson(p, "inbox")}
          />
        </View>

        {/* SENT — আমি যাদের প্রশ্ন করেছি */}
        <View style={{ width }}>
          {sentMounted && (
            <PeopleTab
              mode="sent"
              onPress={(p) => handlePressPerson(p, "sent")}
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Index;
