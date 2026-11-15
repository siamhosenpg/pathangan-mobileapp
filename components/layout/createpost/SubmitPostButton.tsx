import { Text, TouchableOpacity } from "react-native";

interface Props {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

const ACCENT = "#00914d";

const SubmitPostButton = ({ label, disabled = false, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{
        backgroundColor: ACCENT,
        opacity: disabled ? 0.45 : 1,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default SubmitPostButton;
