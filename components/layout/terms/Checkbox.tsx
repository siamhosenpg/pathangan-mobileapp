import * as Haptics from "expo-haptics";
import { TouchableOpacity, View } from "react-native";

// টিক চিহ্ন আইকন (checkbox টিক দিলে ভেতরে দেখায়)
import CheckIcon from "@/assets/icons/checked.svg";

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  hasError,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(!checked);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        className={`w-6 h-6 rounded-md items-center justify-center border-2 ${
          checked
            ? "bg-accent border-accent"
            : hasError
              ? "border-red-500"
              : "border-border dark:border-dark-border"
        }`}
      >
        {checked && <CheckIcon width={16} height={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}
