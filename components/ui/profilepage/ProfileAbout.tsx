import type { EducationEntry, User, WorkEntry } from "@/types/userTypes";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import EducationCard from "./EducationCard";
import WorkCard from "./WorkCard";

interface Props {
  work: WorkEntry[];
  educations: EducationEntry[];
  user: User;
}

const ProfileAbout = ({ work, educations, user }: Props) => {
  const hasWork = work?.length > 0;
  const hasEducation = educations?.length > 0;
  const hasInfo = user.location || user.email || user.gender || user.createdAt;

  if (!hasWork && !hasEducation && !hasInfo) return null;

  const joinedYear = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;

  const genderLabel =
    user.gender === "male"
      ? "পুরুষ"
      : user.gender === "female"
        ? "মহিলা"
        : (user.gender ?? null);

  return (
    <View className="bg-background dark:bg-dark-background px-4 py-4 pb-6 gap-5">
      {/* Work */}
      {hasWork && (
        <View>
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="briefcase-outline" size={15} color="#00914d" />
            <Text className="text-text dark:text-dark-text font-semibold text-sm">
              কর্মস্থল
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
            <Ionicons name="school-outline" size={15} color="#00914d" />
            <Text className="text-text dark:text-dark-text font-semibold text-sm">
              শিক্ষাগত যোগ্যতা
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
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="person-circle-outline" size={15} color="#00914d" />
            <Text className="text-text dark:text-dark-text font-semibold text-sm">
              ব্যক্তিগত তথ্য
            </Text>
          </View>
          <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-3 gap-3">
            {user.email && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
                  <Ionicons name="mail-outline" size={15} color="#00914d" />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    ইমেইল
                  </Text>
                  <Text className="text-text dark:text-dark-text text-sm font-medium">
                    {user.email}
                  </Text>
                </View>
              </View>
            )}
            {user.location && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
                  <Ionicons name="location-outline" size={15} color="#00914d" />
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
                <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
                  <Ionicons
                    name="transgender-outline"
                    size={15}
                    color="#00914d"
                  />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    লিঙ্গ
                  </Text>
                  <Text className="text-text dark:text-dark-text text-sm font-medium">
                    {genderLabel}
                  </Text>
                </View>
              </View>
            )}
            {joinedYear && (
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
                  <Ionicons name="calendar-outline" size={15} color="#00914d" />
                </View>
                <View>
                  <Text className="text-text-tertiary dark:text-dark-text-tertiary text-xs">
                    যোগদান
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
