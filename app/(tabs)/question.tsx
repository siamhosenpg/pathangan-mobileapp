import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import { useGetAllQuestionsQuery } from "@/redux/api/post/questionApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuestionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError } = useGetAllQuestionsQuery({});

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
          প্রশ্ন
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/create" as any)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "#00914d",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 99,
          }}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
            প্রশ্ন করুন
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#00914d" />
        </View>
      ) : isError ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
          <Text style={{ color: "#6B7280", fontSize: 14 }}>
            প্রশ্ন লোড করা যায়নি
          </Text>
        </View>
      ) : data?.questions?.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
          <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
            এখনো কোনো প্রশ্ন নেই
          </Text>
        </View>
      ) : (
        <FlatList
          data={data?.questions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <QuestionCard post={item} />}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 90,
            gap: 8,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
