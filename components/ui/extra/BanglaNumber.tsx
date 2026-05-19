// components/BanglaNumber.tsx

import React from "react";
import { Text, TextStyle } from "react-native";

interface BanglaNumberProps {
  value: number | string;
  style?: TextStyle;
}

const toBanglaNumber = (value: number | string): string => {
  const englishNumbers = "0123456789";
  const banglaNumbers = "০১২৩৪৫৬৭৮৯";

  return value
    .toString()
    .split("")
    .map((char) => {
      const index = englishNumbers.indexOf(char);

      return index !== -1 ? banglaNumbers[index] : char;
    })
    .join("");
};

const BanglaNumber = ({ value, style }: BanglaNumberProps) => {
  return <Text style={style}>{toBanglaNumber(value)}</Text>;
};

export default BanglaNumber;
