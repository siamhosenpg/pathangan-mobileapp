import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  postId: string;
  postAuthorId: string;
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PostThreeDotMenu = ({
  postId,
  postAuthorId,
  visible,
  onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwnPost = currentUserId === postAuthorId;

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleCopyLink = () => {
    // await Clipboard.setStringAsync(`https://prosongo.com/post/${postId}`);
    onClose();
  };

  const handleDeletePost = () => {
    // TODO: dispatch delete
    console.log("Delete post:", postId);
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      icon: "help-circle-outline",
      title: "কেন এই পোস্টটি দেখছি?",
      subtitle: "এই পোস্টটি কেন দেখানো হচ্ছে তা জানুন",
      onPress: onClose,
    },
    {
      icon: "link-outline",
      title: "লিংক কপি করুন",
      subtitle: "এই পোস্টের লিংক কপি করুন",
      onPress: handleCopyLink,
    },
    {
      icon: "eye-off-outline",
      title: "আগ্রহী নই",
      subtitle: "এই ধরনের পোস্ট কম দেখাও",
      onPress: onClose,
    },
    {
      icon: "flag-outline",
      title: "পোস্ট রিপোর্ট করুন",
      subtitle: "এই পোস্টটি নিয়ে আমি উদ্বিগ্ন",
      onPress: onClose,
    },
  ];

  if (isOwnPost) {
    menuItems.push({
      icon: "trash-outline",
      title: "পোস্ট ডিলিট করুন",
      subtitle: "এই পোস্টটি স্থায়ীভাবে মুছে ফেলুন",
      onPress: handleDeletePost,
      danger: true,
    });
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: backdropAnim,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
          paddingBottom: insets.bottom + 8,
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 24,
        }}
      >
        {/* Handle bar */}
        <View
          style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 99,
              backgroundColor: "#E5E7EB",
            }}
          />
        </View>

        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
            পোস্ট অপশন
          </Text>
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.danger && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#F3F4F6",
                    marginVertical: 8,
                    marginHorizontal: 4,
                  }}
                />
              )}
              <TouchableOpacity
                onPress={item.onPress}
                activeOpacity={0.6}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 11,
                  borderRadius: 14,
                  marginBottom: 2,
                  backgroundColor: item.danger
                    ? "rgba(239,68,68,0.06)"
                    : "transparent",
                }}
              >
                {/* Icon circle */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 99,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: item.danger
                      ? "rgba(239,68,68,0.1)"
                      : "#F3F4F6",
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? "#EF4444" : "#374151"}
                  />
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: item.danger ? "#EF4444" : "#111827",
                      lineHeight: 20,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: item.danger ? "#FCA5A5" : "#6B7280",
                      marginTop: 1,
                    }}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                {/* Chevron */}
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default PostThreeDotMenu;
