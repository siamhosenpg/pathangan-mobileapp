import type { EducationEntry, WorkEntry } from "@/types/userTypes";
import { Text, View } from "react-native";
import EducationCard from "./EducationCard";
import WorkCard from "./WorkCard";

interface Props {
  work: WorkEntry[];
  educations: EducationEntry[];
}

const ProfileAbout = ({ work, educations }: Props) => {
  if (!work?.length && !educations?.length) return null;

  return (
    <View className="bg-background  dark:bg-dark-background p-4">
      {work?.length > 0 && (
        <View className="mb-4">
          <Text className="text-text font-semibold text-base px-1 mb-2 dark:text-dark-text">
            কর্ম স্থল
          </Text>
          <View className="gap-2">
            {work.map((w) => (
              <WorkCard key={w._id} work={w} />
            ))}
          </View>
        </View>
      )}

      {educations?.length > 0 && (
        <View>
          <Text className="text-text dark:text-dark-text font-semibold text-base px-1 mb-2">
            শিক্ষাগত যোগ্যতা
          </Text>
          <View className="gap-2">
            {educations.map((education) => (
              <EducationCard key={education._id} education={education} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileAbout;
