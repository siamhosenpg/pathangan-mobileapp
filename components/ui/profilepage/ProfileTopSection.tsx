import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
// import UserRating from "@/components/ui/star/UserRating"; // পরে uncomment করো
// import FollowStats from "./FollowStats"; // পরে uncomment করো
import { useGetUnreadCountQuery } from "@/redux/api/privateQuestion/privateQuestionApi";
import type { User } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GreenMark from "../badges/GreenMark";
import FollowButtonProfile from "../buttons/FollowButtonProfile";
import AskQuestionModal from "../card/questioncard/AskQuestionModal";
import UserRating from "../rating/UserRating";
import FollowStats from "./FollowStats";

interface Props {
  data: User;
}

const ProfileTopSection = ({ data }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnProfile = currentUser?.username === data.username;
  // ✅ শুধু নিজের profile হলে unread count fetch করবে
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isOwnProfile,
  });
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <View className="bg-background dark:bg-dark-background">
      {/* Cover Image */}
      <View className="w-full  p-4 ">
        {data.coverImage ? (
          <Image
            source={{ uri: data.coverImage }}
            className="w-full aspect-[6/2] rounded-lg border border-border dark:border-dark-border"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full aspect-[6/2] bg-accent/20 rounded-lg" />
        )}
      </View>

      {/* Profile Row */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-2 justify-start ">
          {/* Avatar */}
          <View className="w-20 h-20 rounded-full border border-border dark:border-dark-border overflow-hidden bg-accent/20">
            {data.profileImage ? (
              <Image
                source={{ uri: data.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-accent/20">
                <Text className="text-4xl font-bold text-accent uppercase mt-1">
                  {data.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name + Rating */}
          <View className="  ">
            <View className="flex-row items-center gap-1">
              <Text className="text-lg font-bold text-text dark:text-dark-text">
                {data.name}
              </Text>
              {data?.greenmarkVerified && (
                <GreenMark mark={!!data.greenmarkVerified} size={16} />
              )}
            </View>
            <View className="mt-0.5">
              <UserRating userId={data._id} />
            </View>
          </View>
        </View>
        <View className="mt-1 flex-row items-center gap-2">
          {!isOwnProfile && <FollowButtonProfile targetUserId={data._id} />}
          {isOwnProfile && (
            <TouchableOpacity
              onPress={() =>
                router.replace("/private-questions/privatequestion")
              }
              className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border border-border dark:border-dark-border"
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={isDark ? "#c4c4c4" : "#3a3a3a"}
              />
              <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
                {t("privateQuestions")}
              </Text>
              {unreadCount > 0 && (
                <View className="w-5 h-5 rounded-full bg-red-600 items-center justify-center">
                  <Text className="text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "৯+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {!isOwnProfile && (
            <>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border border-border dark:border-dark-border"
              >
                <Ionicons
                  name="help-circle-outline"
                  size={16}
                  color={isDark ? "#c4c4c4" : "#3a3a3a"}
                />
                <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
                  {t("askQuestion")}
                </Text>
              </TouchableOpacity>

              <AskQuestionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                receiverId={data._id}
                receiverName={data.name}
              />
            </>
          )}
        </View>

        {/* Follow Stats */}
        <View className="mt-4">
          <FollowStats activityStats={data.activityStats} />
        </View>
        {/* Bio + About */}
        {data.bio && (
          <Text className="mt-3 font-semibold text-base text-text dark:text-dark-text">
            {data.bio}
          </Text>
        )}
        {data.aboutText && (
          <Text className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary leading-5">
            {data.aboutText}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileTopSection;
