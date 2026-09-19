import type { EducationEntry, User, WorkEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import EducationCard from "./EducationCard";
import WorkCard from "./WorkCard";

interface Props {
  work: WorkEntry[];
  educations: EducationEntry[];
  user: User;
}

const ProfileAbout = ({ work, educations, user }: Props) => {
  const { t } = useTranslation();
  const hasWork = work?.length > 0;
  const hasEducation = educations?.length > 0;
  const hasInfo = user.location || user.email || user.gender || user.createdAt;

  if (!hasWork && !hasEducation && !hasInfo) return null;

  const joinedYear = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;

  const genderLabel =
    user.gender === "male"
      ? t("male")
      : user.gender === "female"
        ? t("female")
        : (user.gender ?? null);

  return (
    <View className="bg-background dark:bg-dark-background px-4 py-1 pb-4 gap-5 border-b border-border dark:border-dark-border ">
      {/* Work */}
      {hasWork && (
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-text text-sm dark:text-dark-text font-semibold ">
              {t("work")}
            </Text>
          </View>
          <View className="gap-2">
            {work.map((w) => (
              <WorkCard key={w._id} work={w} />
            ))}
          </View>
        </View>
      )}

      {/* Education */}
      {hasEducation && (
        <View>
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-text text-sm dark:text-dark-text font-semibold ">
              {t("educationalQualification")}
            </Text>
          </View>
          <View className="gap-2">
            {educations.map((education) => (
              <EducationCard key={education._id} education={education} />
            ))}
          </View>
        </View>
      )}
      {/* Basic Info */}
      {hasInfo && (
        <View>
          <View className="flex-row items-center gap-2 mb-3 ">
            <Text className="text-text text-sm dark:text-dark-text font-semibold ">
              {t("personalInfo")}
            </Text>
          </View>
          <View className=" py-1 gap-3">
            {user.email && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg border-border border dark:border-dark-border items-center justify-center">
                  <Ionicons name="mail-outline" size={15} />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    {t("email")}
                  </Text>
                  <Text className="text-text dark:text-dark-text text-sm font-medium">
                    {user.email}
                  </Text>
                </View>
              </View>
            )}
            {user.location && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg border-border border dark:border-dark-border items-center justify-center">
                  <Ionicons name="location-outline" size={15} />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    অবস্থান
                  </Text>
                  <Text className="text-text dark:text-dark-text text-sm font-medium">
                    {user.location}
                  </Text>
                </View>
              </View>
            )}
            {genderLabel && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg border-border border dark:border-dark-border items-center justify-center">
                  <Ionicons name="transgender-outline" size={15} />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    {t("gender")}
                  </Text>
                  <Text className="text-text dark:text-dark-text text-sm font-medium">
                    {genderLabel}
                  </Text>
                </View>
              </View>
            )}
            {joinedYear && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg border-border border dark:border-dark-border items-center justify-center">
                  <Ionicons name="calendar-outline" size={15} />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    {t("joined")}
                  </Text>
                  <Text className="text-text dark:text-dark-text text-sm font-medium">
                    {joinedYear} সাল থেকে
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileAbout;
