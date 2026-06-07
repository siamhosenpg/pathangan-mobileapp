import React from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

import PrivateQuestionCard from "@/components/ui/card/questioncard/PrivateQuestionCard";
import { useGetSentQuestionsInfiniteQuery } from "@/redux/api/privateQuestion/privateQuestionApi";

type Props = {
  onPress: (id: string) => void;
};

const SentTab = ({ onPress }: Props) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useGetSentQuestionsInfiniteQuery({ limit: 10 });

  const questions = data?.pages?.flatMap((p) => p.questions) ?? [];

  return (
    <View className="flex-1">
      {isFetching && questions.length === 0 ? (
        <ActivityIndicator size="large" color="#00914d" className="flex-1" />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PrivateQuestionCard
              question={item}
              mode="sent"
              onPress={onPress}
              onStatusChange={() => {}}
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 20,
          }}
        />
      )}
    </View>
  );
};

export default SentTab;
