import type {
  PrivateQuestionPerson,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function toBanglaNumber(value: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
}

// ভাষা অনুযায়ী সংখ্যা (bn হলে বাংলা অঙ্ক, না হলে ইংরেজি)
export function formatNumber(value: number, lang?: string): string {
  return lang?.startsWith("bn") ? toBanglaNumber(value) : String(value);
}

// ভাষা অনুযায়ী তারিখের locale
export function getDateLocale(lang?: string): string {
  return lang?.startsWith("bn") ? "bn-BD" : "en-US";
}

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
  const { t, i18n } = useTranslation();
  const isDeleted = !person.user;
  const name =
    person.user?.name || person.user?.username || t("privateData.deletedUser");
  const hasUnread = mode === "inbox" && person.unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(person)}
      activeOpacity={0.72}
      className={` border-b p-4 ${
        hasUnread ? "border-accent/30" : "border-border dark:border-dark-border"
      }`}
    >
      <View className="flex-row items-center gap-2">
        <UserAvatar
          name={name}
          profileImage={person.user?.profileImage}
          isDeleted={isDeleted}
          hasUnread={hasUnread}
        />

        <View className="flex-1">
          <Text
            className={` font-semibold ${
              isDeleted
                ? "text-text-tertiary dark:text-dark-text-tertiary italic"
                : "text-text dark:text-dark-text"
            }`}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className=" mt-0.5 text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {new Date(person.lastQuestionAt).toLocaleDateString(
              getDateLocale(i18n.language),
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            )}
          </Text>
        </View>

        <View className="items-end gap-1">
          <View className=" py-2">
            <Text className="text-xs font-semibold text-accent">
              {t("privateData.questionCount", {
                num: formatNumber(person.totalCount, i18n.language),
              })}
            </Text>
          </View>
          {hasUnread && (
            <Text className="text-xs font-medium text-accent">
              {t("privateData.newCount", {
                num: formatNumber(person.unreadCount, i18n.language),
              })}
            </Text>
          )}
        </View>
      </View>

      <Text
        className="mt-2 font-medium text-text-secondary dark:text-dark-text-secondary leading-relaxed"
        numberOfLines={2}
      >
        {person.lastQuestionText}
      </Text>
    </TouchableOpacity>
  );
};

export default PrivateQuestionPersonCard;
