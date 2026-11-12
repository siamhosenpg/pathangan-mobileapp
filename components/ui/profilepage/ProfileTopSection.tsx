import FileEditIcon from "@/assets/icons/file-edit.svg";
import QuestionIcon from "@/assets/icons/map-marker-question.svg";
import MenuDotsIcon from "@/assets/icons/menu-dots.svg";
import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useGetUnreadCountQuery } from "@/redux/api/privateQuestion/privateQuestionApi";
import { useAppSelector } from "@/redux/hooks";
import type { User } from "@/types/userTypes";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import OptimizedImage from "../avatar/OptimizedImage";
import ProfileImage from "../avatar/ProfileImage";
import GreenMark from "../badges/GreenMark";
import FollowButtonProfile from "../buttons/FollowButtonProfile";
import AskQuestionModal from "../card/questioncard/AskQuestionModal";
import TextFont from "../font/TextFont";
import UserRating from "../rating/UserRating";
import FollowStats from "./FollowStats";
import ProfileMenuSheet from "./ProfileMenuSheet";

interface Props {
  data: User;
}

const ProfileTopSection = ({ data }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { open } = useBottomSheet();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnProfile = currentUser?.username === data.username;
  // ✅ শুধু নিজের profile হলে unread count fetch করবে
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isOwnProfile,
  });
  const unreadCount = unreadData?.unreadCount ?? 0;
  const isDeletedUser = !data; // যদি user ডিলিট হয়ে যায়, তাহলে data null হবে

  return (
    <View className="bg-background dark:bg-dark-background">
      {/* Cover Image */}
      <View className="w-full  p-4 ">
        <OptimizedImage
          uri={data.coverImage}
          aspectRatio={6 / 2}
          radius={14}
          fallbackIcon="book-outline"
          recyclingKey={data._id}
          className="border border-border/20 dark:border-dark-border/20"
        />
      </View>

      {/* Profile Row */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-2 justify-start ">
          {/* Avatar */}
          <ProfileImage
            uri={data.profileImage}
            name={data.name}
            size={68}
            isDeleted={isDeletedUser}
            recyclingKey={data._id}
          />

          {/* Name + Rating */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View className="flex-row items-center gap-1">
              <TextFont
                className="text-lg font-bold text-text dark:text-dark-text"
                style={{ flexShrink: 1, flex: 0 }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {data?.name || "Deleted User"}
              </TextFont>
              {data?.greenmarkVerified && (
                <GreenMark mark={!!data.greenmarkVerified} size={16} />
              )}
            </View>
            <View className="mt-1">
              {/* ✅ আলাদা API call নেই — profile data থেকেই rating আসছে */}
              <UserRating
                averageRating={data.activityStats?.averageRating ?? 0}
                totalRatingCount={data.activityStats?.totalRating ?? 0}
              />
            </View>
          </View>
        </View>

        <View className="mt-1 flex-row items-center gap-2">
          {!isOwnProfile && <FollowButtonProfile targetUserId={data._id} />}

          {isOwnProfile && (
            <TouchableOpacity
              onPress={() => router.push("/private-questions/privatequestion")}
              className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border border-border dark:border-dark-border"
            >
              <QuestionIcon
                width={14}
                height={14}
                color={isDark ? "#c4c4c4" : "#3a3a3a"}
              />
              <Text className=" font-semibold text-text-secondary dark:text-dark-text-secondary">
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

          {isOwnProfile && (
            <TouchableOpacity
              onPress={() => router.push("/(pages)/profile/editprofile")}
              className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border border-border dark:border-dark-border"
            >
              <FileEditIcon
                width={15}
                height={15}
                color={isDark ? "#c4c4c4" : "#3a3a3a"}
              />
            </TouchableOpacity>
          )}

          {!isOwnProfile && (
            <>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border border-border dark:border-dark-border"
              >
                <QuestionIcon
                  width={14}
                  height={14}
                  color={isDark ? "#c4c4c4" : "#3a3a3a"}
                />
                <Text className=" font-semibold text-text-secondary dark:text-dark-text-secondary">
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

          {!isOwnProfile && (
            <TouchableOpacity
              onPress={() =>
                open(
                  <ProfileMenuSheet
                    userId={data._id}
                    username={data.username}
                    name={data.name}
                    bio={data?.bio}
                    profileImage={data.profileImage}
                  />,
                )
              }
              className="flex-row items-center self-start gap-2 mt-3 px-4 py-2 rounded-full border border-border dark:border-dark-border"
            >
              <MenuDotsIcon
                width={15}
                height={15}
                color={isDark ? "#c4c4c4" : "#3a3a3a"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Follow Stats */}
        <View className="mt-4">
          <FollowStats activityStats={data.activityStats} userId={data._id} />
        </View>

        {/* Bio + About */}
        {data.bio && (
          <TextFont className="mt-3 font-semibold text-base text-text dark:text-dark-text">
            {data?.bio}
          </TextFont>
        )}
        {data.aboutText && (
          <TextFont className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary leading-5">
            {data.aboutText}
          </TextFont>
        )}
      </View>
    </View>
  );
};

export default ProfileTopSection;
