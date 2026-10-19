import PrivateQuestionPersonCard from "@/components/ui/card/questioncard/PrivateQuestionPersonCard";
import { useGetPrivateQuestionPeopleInfiniteQuery } from "@/redux/api/privateQuestion/privateQuestionApi";
import type {
  PrivateQuestionPerson,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

type Props = {
  mode: QuestionMode;
  onPress: (person: PrivateQuestionPerson) => void;
};

const PeopleTab = ({ mode, onPress }: Props) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useGetPrivateQuestionPeopleInfiniteQuery({ mode, limit: 15 });

  const people = data?.pages?.flatMap((p) => p.people) ?? [];

  if (isFetching && people.length === 0) {
    return (
      <ActivityIndicator size="large" color="#00914d" className="flex-1" />
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={people}
        keyExtractor={(item) => String(item.userId)}
        renderItem={({ item }) => (
          <PrivateQuestionPersonCard
            person={item}
            mode={mode}
            onPress={onPress}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        // pagination এর সময় উপরের spinner ঘুরবে না
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={refetch}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <Text className="text-3xl mb-2">📭</Text>
            <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary text-center">
              {mode === "inbox"
                ? "এখনো কেউ আপনাকে প্রশ্ন করেনি"
                : "আপনি এখনো কাউকে প্রশ্ন করেননি"}
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color="#00914d"
              style={{ paddingVertical: 16 }}
            />
          ) : null
        }
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
      />
    </View>
  );
};

export default PeopleTab;
