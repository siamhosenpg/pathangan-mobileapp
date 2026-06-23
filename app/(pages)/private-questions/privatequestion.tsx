import InboxTab from "@/components/layout/private-questions/InboxTab";
import SentTab from "@/components/layout/private-questions/SentTab";
import PrivateQuestionHeader from "@/components/ui/headers/PrivateQuestionHeader";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Animated, Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Index = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [sentMounted, setSentMounted] = useState(false);
  const translateX = useState(new Animated.Value(0))[0];

  const switchTab = (tab: "inbox" | "sent") => {
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

  const handlePress = (id: string) => {
    router.push(`/private-questions/${id}`);
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
        {/* INBOX */}
        <View style={{ width }}>
          <InboxTab onPress={handlePress} />
        </View>

        {/* SENT */}
        <View style={{ width }}>
          {sentMounted && <SentTab onPress={handlePress} />}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Index;
