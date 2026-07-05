import { Answer } from "@/types/answerTypes";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../../badges/GreenMark";
import { useBottomSheet } from "../../bottom-sheet/BottomSheetProvider";
import TimeAgo from "../../datetime/TimeAgo";

import Entypo from "@expo/vector-icons/Entypo";
import AnswerThreeDotMenu from "./AnswerThreeDotMenu";

export function AnswerUserCard({ answer }: { answer: Answer }) {
  const router = useRouter();
  const { open } = useBottomSheet();

  const handlePress = () => {
    router.push(`/${answer.userId.username}`);
  };

  return (
    <View className=" flex-row items-center gap-3 mb-2">
      {/* ইউজার info */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={handlePress}
          className="w-10 h-10 rounded-full bg-background-secondary dark:bg-dark-background-secondary overflow-hidden shrink-0 items-center justify-center"
        >
          {answer.userId.profileImage ? (
            <Image
              source={{ uri: answer.userId.profileImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
              {answer.userId.name?.[0]}
            </Text>
          )}
        </TouchableOpacity>
        <View>
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {answer.userId.name}
            </Text>
            <GreenMark mark={true} size={14} />
          </View>

          <TimeAgo
            date={answer.createdAt}
            className="text-xs text-text-tertiary dark:text-dark-text-tertiary font-medium"
          />
        </View>
      </View>
      <TouchableOpacity
        className="ml-auto"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() =>
          open(
            <AnswerThreeDotMenu
              answerId={answer._id}
              answerAuthorId={
                (answer.userId as any)._id ?? (answer.userId as any).id
              }
            />,
          )
        }
      >
        <Entypo name="dots-three-horizontal" size={20} color="#555" />
      </TouchableOpacity>
    </View>
  );
}
