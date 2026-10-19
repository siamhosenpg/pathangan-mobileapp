import type {
  PrivateQuestionPerson,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function toBanglaNumber(value: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
}

export const DELETED_USER_NAME = "ডিলিট হওয়া ইউজার";

// ── Avatar (অন্য পেজেও ব্যবহার হবে) ──
export const UserAvatar = ({
  name,
  profileImage,
  isDeleted,
  hasUnread = false,
  size = "md",
}: {
  name: string;
  profileImage?: string;
  isDeleted: boolean;
  hasUnread?: boolean;
  size?: "sm" | "md";
}) => {
  const dim = size === "sm" ? "w-9 h-9" : "w-12 h-12";
  return (
    <View className="relative">
      <View
        className={`${dim} rounded-full overflow-hidden border border-border dark:border-dark-border`}
      >
        {profileImage && !isDeleted ? (
          <Image
            source={{ uri: profileImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-accent/20 items-center justify-center">
            <Text className="text-base font-bold text-accent uppercase">
              {isDeleted ? "?" : name?.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      {hasUnread && (
        <View className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-background dark:border-dark-background" />
      )}
    </View>
  );
};

interface Props {
  person: PrivateQuestionPerson;
  mode: QuestionMode;
  onPress: (person: PrivateQuestionPerson) => void;
}

const PrivateQuestionPersonCard = ({ person, mode, onPress }: Props) => {
  const isDeleted = !person.user;
  const name = person.user?.name || person.user?.username || DELETED_USER_NAME;
  const hasUnread = mode === "inbox" && person.unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(person)}
      activeOpacity={0.72}
      className={`mx-4 mb-3 rounded-2xl border p-4 ${
        hasUnread
          ? "border-accent/30 bg-accent/5 dark:bg-accent/10"
          : "border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <UserAvatar
          name={name}
          profileImage={person.user?.profileImage}
          isDeleted={isDeleted}
          hasUnread={hasUnread}
        />

        <View className="flex-1">
          <Text
            className={`text-sm font-semibold ${
              isDeleted
                ? "text-text-tertiary dark:text-dark-text-tertiary italic"
                : "text-text dark:text-dark-text"
            }`}
            numberOfLines={1}
          >
            {name}
          </Text>
          {!isDeleted && !!person.user?.username && (
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              @{person.user.username}
            </Text>
          )}
        </View>

        <View className="items-end gap-1">
          <View className="px-2.5 py-1 rounded-full bg-accent/10">
            <Text className="text-xs font-semibold text-accent">
              {toBanglaNumber(person.totalCount)} টি প্রশ্ন
            </Text>
          </View>
          {hasUnread && (
            <Text className="text-xs font-medium text-accent">
              {toBanglaNumber(person.unreadCount)} টি নতুন
            </Text>
          )}
        </View>
      </View>

      <Text
        className="mt-3 text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed"
        numberOfLines={2}
      >
        {person.lastQuestionText}
      </Text>

      <Text className="mt-2 text-xs text-text-tertiary dark:text-dark-text-tertiary">
        {new Date(person.lastQuestionAt).toLocaleDateString("bn-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Text>
    </TouchableOpacity>
  );
};

export default PrivateQuestionPersonCard;
